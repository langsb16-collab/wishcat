/**
 * 📧 Email API Routes
 * 
 * 이메일 발송 관련 API 엔드포인트
 */

import { Hono } from 'hono';
import { Bindings } from '../types';
import { sendEmail, getVerificationEmailTemplate, getProjectNotificationTemplate } from '../services/resend';

const email = new Hono<{ Bindings: Bindings }>();

/**
 * POST /api/email/send-verification
 * 회원가입 인증 이메일 발송
 */
email.post('/send-verification', async (c) => {
  try {
    const { email: userEmail, userName, verificationUrl, language = 'ko' } = await c.req.json();

    if (!userEmail || !userName || !verificationUrl) {
      return c.json({
        success: false,
        error: 'Missing required fields: email, userName, verificationUrl'
      }, 400);
    }

    const html = getVerificationEmailTemplate(userName, verificationUrl, language);
    
    const result = await sendEmail(c.env.RESEND_API_KEY, {
      to: userEmail,
      subject: language === 'ko' ? '🎉 FeeZero 회원가입 인증' : '🎉 FeeZero Email Verification',
      html,
      from: c.env.RESEND_FROM_EMAIL
    });

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }

    return c.json({
      success: true,
      data: { emailId: result.id }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return c.json({
      success: false,
      error: 'Failed to send verification email'
    }, 500);
  }
});

/**
 * POST /api/email/send-notification
 * 프로젝트 알림 이메일 발송
 */
email.post('/send-notification', async (c) => {
  try {
    const {
      email: userEmail,
      userName,
      projectTitle,
      message,
      actionUrl,
      actionText,
      language = 'ko'
    } = await c.req.json();

    if (!userEmail || !userName || !projectTitle || !message || !actionUrl || !actionText) {
      return c.json({
        success: false,
        error: 'Missing required fields'
      }, 400);
    }

    const html = getProjectNotificationTemplate(
      userName,
      projectTitle,
      message,
      actionUrl,
      actionText,
      language
    );
    
    const result = await sendEmail(c.env.RESEND_API_KEY, {
      to: userEmail,
      subject: `📢 ${projectTitle} - ${language === 'ko' ? '알림' : 'Notification'}`,
      html,
      from: c.env.RESEND_FROM_EMAIL
    });

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }

    return c.json({
      success: true,
      data: { emailId: result.id }
    });
  } catch (error) {
    console.error('Email notification error:', error);
    return c.json({
      success: false,
      error: 'Failed to send notification email'
    }, 500);
  }
});

export default email;
