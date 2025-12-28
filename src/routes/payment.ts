/**
 * 💳 Payment API Routes
 * 
 * USDT 결제 관련 API 엔드포인트
 */

import { Hono } from 'hono';
import { Bindings } from '../types';
import {
  createCharge,
  getCharge,
  verifyWebhookSignature,
  parseWebhookEvent,
  getPaymentStatus,
  createProjectPaymentCharge
} from '../services/coinbase';

const payment = new Hono<{ Bindings: Bindings }>();

/**
 * POST /api/payment/create
 * 결제 생성
 */
payment.post('/create', async (c) => {
  try {
    const { projectId, userId, amount, currency, projectTitle } = await c.req.json();

    if (!projectId || !userId || !amount || !currency || !projectTitle) {
      return c.json({
        success: false,
        error: 'Missing required fields'
      }, 400);
    }

    // 프로젝트 결제 생성
    const charge = createProjectPaymentCharge(
      projectId,
      userId,
      amount,
      currency,
      projectTitle
    );

    const result = await createCharge(c.env.COINBASE_API_KEY, charge);

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }

    // 데이터베이스에 결제 정보 저장 (필요시)
    // await c.env.DB.prepare(`
    //   INSERT INTO payments (...)
    //   VALUES (...)
    // `).run();

    return c.json({
      success: true,
      data: {
        chargeId: result.data?.id,
        chargeCode: result.data?.code,
        paymentUrl: result.data?.hosted_url,
        amount: result.data?.pricing.local.amount,
        currency: result.data?.pricing.local.currency
      }
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return c.json({
      success: false,
      error: 'Failed to create payment'
    }, 500);
  }
});

/**
 * GET /api/payment/:chargeId
 * 결제 상태 조회
 */
payment.get('/:chargeId', async (c) => {
  try {
    const chargeId = c.req.param('chargeId');

    const result = await getCharge(c.env.COINBASE_API_KEY, chargeId);

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }

    return c.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Payment fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch payment'
    }, 500);
  }
});

/**
 * POST /api/payment/webhook
 * Coinbase Commerce Webhook 처리
 */
payment.post('/webhook', async (c) => {
  try {
    const signature = c.req.header('X-CC-Webhook-Signature');
    const payload = await c.req.text();

    if (!signature) {
      return c.json({
        success: false,
        error: 'Missing webhook signature'
      }, 400);
    }

    // 서명 검증
    const isValid = await verifyWebhookSignature(
      payload,
      signature,
      c.env.COINBASE_WEBHOOK_SECRET
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return c.json({
        success: false,
        error: 'Invalid signature'
      }, 401);
    }

    // 이벤트 파싱
    const event = parseWebhookEvent(payload);
    if (!event) {
      return c.json({
        success: false,
        error: 'Invalid webhook payload'
      }, 400);
    }

    // 결제 상태 확인
    const status = getPaymentStatus(event);
    console.log('Payment webhook received:', {
      type: event.type,
      chargeId: event.data.id,
      status: status.status
    });

    // 결제 상태에 따른 처리
    switch (status.status) {
      case 'completed':
        // TODO: 프로젝트 에스크로 업데이트
        // TODO: 사용자에게 알림 전송
        console.log('Payment completed:', event.data.id);
        break;
      case 'failed':
        // TODO: 결제 실패 처리
        console.log('Payment failed:', event.data.id);
        break;
      case 'pending':
        // TODO: 대기 중 처리
        console.log('Payment pending:', event.data.id);
        break;
    }

    return c.json({
      success: true,
      message: 'Webhook processed'
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return c.json({
      success: false,
      error: 'Failed to process webhook'
    }, 500);
  }
});

export default payment;
