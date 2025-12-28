/**
 * 💳 Coinbase Commerce Service
 * 
 * USDT 암호화폐 결제 처리
 * - 결제 생성 (Charge)
 * - 결제 상태 확인
 * - Webhook 처리
 * 
 * @see https://docs.cloud.coinbase.com/commerce/docs
 */

export interface CoinbaseCharge {
  name: string;
  description: string;
  pricing_type: 'fixed_price';
  local_price: {
    amount: string;
    currency: 'USD' | 'EUR' | 'KRW';
  };
  metadata?: {
    project_id?: string;
    user_id?: string;
    [key: string]: any;
  };
  redirect_url?: string;
  cancel_url?: string;
}

export interface CoinbaseChargeResponse {
  success: boolean;
  data?: {
    id: string;
    code: string;
    hosted_url: string;
    pricing: {
      local: { amount: string; currency: string };
      [key: string]: any;
    };
    addresses?: {
      ethereum?: string;
      [key: string]: string;
    };
  };
  error?: string;
}

export interface CoinbaseWebhookEvent {
  id: string;
  type: 'charge:created' | 'charge:confirmed' | 'charge:failed' | 'charge:delayed' | 'charge:pending' | 'charge:resolved';
  data: {
    id: string;
    code: string;
    pricing: any;
    metadata: any;
    timeline: Array<{
      status: string;
      time: string;
    }>;
  };
}

/**
 * 결제 생성
 */
export async function createCharge(
  apiKey: string,
  charge: CoinbaseCharge
): Promise<CoinbaseChargeResponse> {
  try {
    // 테스트 모드
    if (apiKey.includes('test_')) {
      console.log('💳 [DEV MODE] Charge would be created:', charge);
      return {
        success: true,
        data: {
          id: 'test-charge-' + Date.now(),
          code: 'TEST' + Math.random().toString(36).substring(7).toUpperCase(),
          hosted_url: 'https://commerce.coinbase.com/charges/test',
          pricing: {
            local: charge.local_price
          }
        }
      };
    }

    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'X-CC-Api-Key': apiKey,
        'X-CC-Version': '2018-03-22',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(charge)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Coinbase API error: ${error}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Failed to create charge:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 결제 상태 조회
 */
export async function getCharge(
  apiKey: string,
  chargeId: string
): Promise<CoinbaseChargeResponse> {
  try {
    // 테스트 모드
    if (apiKey.includes('test_')) {
      console.log('💳 [DEV MODE] Would fetch charge:', chargeId);
      return {
        success: true,
        data: {
          id: chargeId,
          code: 'TESTCODE',
          hosted_url: 'https://commerce.coinbase.com/charges/test',
          pricing: {
            local: { amount: '100.00', currency: 'USD' }
          }
        }
      };
    }

    const response = await fetch(
      `https://api.commerce.coinbase.com/charges/${chargeId}`,
      {
        method: 'GET',
        headers: {
          'X-CC-Api-Key': apiKey,
          'X-CC-Version': '2018-03-22'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Coinbase API error: ${error}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Failed to get charge:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Webhook 서명 검증
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // 테스트 모드
    if (secret.includes('test_')) {
      console.log('💳 [DEV MODE] Webhook signature would be verified');
      return true;
    }

    // HMAC SHA256 서명 검증
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const payloadData = encoder.encode(payload);
    const signatureData = hexToBytes(signature);

    return await crypto.subtle.verify(
      'HMAC',
      key,
      signatureData,
      payloadData
    );
  } catch (error) {
    console.error('Failed to verify webhook signature:', error);
    return false;
  }
}

/**
 * Webhook 이벤트 처리
 */
export function parseWebhookEvent(payload: string): CoinbaseWebhookEvent | null {
  try {
    return JSON.parse(payload);
  } catch (error) {
    console.error('Failed to parse webhook event:', error);
    return null;
  }
}

/**
 * 결제 상태 확인 헬퍼
 */
export function getPaymentStatus(event: CoinbaseWebhookEvent): {
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  message: string;
} {
  switch (event.type) {
    case 'charge:confirmed':
      return { status: 'completed', message: 'Payment confirmed' };
    case 'charge:failed':
      return { status: 'failed', message: 'Payment failed' };
    case 'charge:pending':
      return { status: 'pending', message: 'Payment pending' };
    case 'charge:created':
      return { status: 'pending', message: 'Payment created' };
    case 'charge:delayed':
      return { status: 'pending', message: 'Payment delayed' };
    default:
      return { status: 'pending', message: 'Unknown status' };
  }
}

// Utility functions
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * USDT 결제 생성 헬퍼 (FeeZero 전용)
 */
export function createProjectPaymentCharge(
  projectId: string,
  userId: string,
  amount: number,
  currency: 'USD' | 'EUR' | 'KRW',
  projectTitle: string
): CoinbaseCharge {
  return {
    name: `FeeZero Project Payment`,
    description: `Payment for project: ${projectTitle}`,
    pricing_type: 'fixed_price',
    local_price: {
      amount: amount.toFixed(2),
      currency
    },
    metadata: {
      project_id: projectId,
      user_id: userId,
      platform: 'feezero',
      payment_type: 'project'
    },
    redirect_url: `https://feezero.pages.dev/projects/${projectId}/payment/success`,
    cancel_url: `https://feezero.pages.dev/projects/${projectId}/payment/cancel`
  };
}
