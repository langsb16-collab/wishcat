/**
 * 📧 Resend Email Service
 * 
 * 이메일 발송 서비스 통합
 * - 회원가입 인증 이메일
 * - 프로젝트 알림
 * - 결제 완료 알림
 * 
 * @see https://resend.com/docs/api-reference/emails/send-email
 */

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface SendEmailResponse {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * 이메일 발송
 */
export async function sendEmail(
  apiKey: string,
  email: EmailTemplate
): Promise<SendEmailResponse> {
  try {
    // API 키가 테스트 키인 경우 실제 발송하지 않음
    if (apiKey.includes('test_key')) {
      console.log('📧 [DEV MODE] Email would be sent:', {
        to: email.to,
        subject: email.subject,
        preview: email.html.substring(0, 100)
      });
      return {
        success: true,
        id: 'dev-email-' + Date.now()
      };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: email.from || 'FeeZero <noreply@feezero.com>',
        to: email.to,
        subject: email.subject,
        html: email.html
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await response.json();
    return {
      success: true,
      id: data.id
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 회원가입 인증 이메일 템플릿
 */
export function getVerificationEmailTemplate(
  userName: string,
  verificationUrl: string,
  language: 'ko' | 'en' | 'zh' | 'ja' = 'ko'
): string {
  const templates = {
    ko: {
      title: '🎉 FeeZero 회원가입을 환영합니다!',
      greeting: `안녕하세요 ${userName}님,`,
      message: 'FeeZero에 가입해주셔서 감사합니다. 아래 버튼을 클릭하여 이메일 인증을 완료해주세요.',
      button: '이메일 인증하기',
      footer: '이 이메일은 본인이 요청하지 않았다면 무시하셔도 됩니다.'
    },
    en: {
      title: '🎉 Welcome to FeeZero!',
      greeting: `Hello ${userName},`,
      message: 'Thank you for signing up. Please click the button below to verify your email.',
      button: 'Verify Email',
      footer: 'If you did not request this, please ignore this email.'
    },
    zh: {
      title: '🎉 欢迎加入 FeeZero！',
      greeting: `您好 ${userName}，`,
      message: '感谢您注册。请点击下面的按钮验证您的电子邮件。',
      button: '验证电子邮件',
      footer: '如果您没有请求此操作，请忽略此电子邮件。'
    },
    ja: {
      title: '🎉 FeeZeroへようこそ！',
      greeting: `こんにちは ${userName}さん、`,
      message: '登録ありがとうございます。以下のボタンをクリックしてメールを確認してください。',
      button: 'メールを確認',
      footer: 'このメールに心当たりがない場合は無視してください。'
    }
  };

  const t = templates[language];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">FeeZero</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Global Freelance Platform</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #667eea; margin-top: 0;">${t.title}</h2>
        <p style="font-size: 16px;">${t.greeting}</p>
        <p style="font-size: 16px;">${t.message}</p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${verificationUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 40px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    display: inline-block;
                    font-weight: bold;
                    font-size: 16px;">
            ${t.button}
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 40px;">
          ${t.footer}
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2024 FeeZero. All rights reserved.<br>
          <a href="https://feezero.com" style="color: #667eea; text-decoration: none;">feezero.com</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * 프로젝트 알림 이메일 템플릿
 */
export function getProjectNotificationTemplate(
  userName: string,
  projectTitle: string,
  message: string,
  actionUrl: string,
  actionText: string,
  language: 'ko' | 'en' | 'zh' | 'ja' = 'ko'
): string {
  const templates = {
    ko: {
      title: '📢 프로젝트 알림',
      greeting: `안녕하세요 ${userName}님,`
    },
    en: {
      title: '📢 Project Notification',
      greeting: `Hello ${userName},`
    },
    zh: {
      title: '📢 项目通知',
      greeting: `您好 ${userName}，`
    },
    ja: {
      title: '📢 プロジェクト通知',
      greeting: `こんにちは ${userName}さん、`
    }
  };

  const t = templates[language];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t.title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #667eea; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">${t.title}</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">${t.greeting}</p>
        <p style="font-size: 16px;"><strong>${projectTitle}</strong></p>
        <p style="font-size: 16px;">${message}</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionUrl}" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            ${actionText}
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}
