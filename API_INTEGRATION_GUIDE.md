# 🔌 FeeZero API 통합 가이드

이 문서는 FeeZero 플랫폼에 통합된 제3자 서비스 API의 사용법을 설명합니다.

## 📋 목차
- [개요](#개요)
- [환경 설정](#환경-설정)
- [API 서비스](#api-서비스)
  - [이메일 (Resend)](#1-이메일-resend)
  - [결제 (Coinbase Commerce)](#2-결제-coinbase-commerce)
  - [AI (OpenAI)](#3-ai-openai)
  - [인증 (Auth0)](#4-인증-auth0)
- [보안 가이드](#보안-가이드)
- [테스트](#테스트)
- [문제 해결](#문제-해결)

## 개요

FeeZero는 다음 제3자 서비스와 통합되어 있습니다:
- **Resend**: 이메일 발송 (회원가입 인증, 알림)
- **Coinbase Commerce**: USDT 암호화폐 결제
- **OpenAI**: AI 기반 프로젝트 분석 및 견적
- **Auth0**: 사용자 인증 및 권한 관리

모든 API는 **테스트 모드**로 작동하며, 실제 API 키를 설정하면 프로덕션 모드로 전환됩니다.

## 환경 설정

### 1. 로컬 개발 환경

`.dev.vars` 파일에 API 키 설정:

\`\`\`env
# 📧 Resend - 이메일 서비스
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@feezero.com

# 💳 Coinbase Commerce - 결제
COINBASE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
COINBASE_WEBHOOK_SECRET=xxxxxxxxxxxx

# 🤖 OpenAI - AI 서비스
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# 🔐 Auth0 - 인증
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=xxxxxxxxxxxx
AUTH0_CLIENT_SECRET=xxxxxxxxxxxx
AUTH0_AUDIENCE=https://feezero-api.com
\`\`\`

### 2. 프로덕션 환경 (Cloudflare Pages)

\`\`\`bash
# Resend
wrangler pages secret put RESEND_API_KEY --project-name feezero
wrangler pages secret put RESEND_FROM_EMAIL --project-name feezero

# Coinbase Commerce
wrangler pages secret put COINBASE_API_KEY --project-name feezero
wrangler pages secret put COINBASE_WEBHOOK_SECRET --project-name feezero

# OpenAI
wrangler pages secret put OPENAI_API_KEY --project-name feezero

# Auth0
wrangler pages secret put AUTH0_DOMAIN --project-name feezero
wrangler pages secret put AUTH0_CLIENT_ID --project-name feezero
wrangler pages secret put AUTH0_CLIENT_SECRET --project-name feezero
wrangler pages secret put AUTH0_AUDIENCE --project-name feezero
\`\`\`

## API 서비스

### 1. 이메일 (Resend)

#### 회원가입 인증 이메일

**엔드포인트**: `POST /api/email/send-verification`

**요청**:
\`\`\`json
{
  "email": "user@example.com",
  "userName": "홍길동",
  "verificationUrl": "https://feezero.com/verify?token=xxx",
  "language": "ko"
}
\`\`\`

**응답**:
\`\`\`json
{
  "success": true,
  "data": {
    "emailId": "email-123"
  }
}
\`\`\`

#### 프로젝트 알림 이메일

**엔드포인트**: `POST /api/email/send-notification`

**요청**:
\`\`\`json
{
  "email": "user@example.com",
  "userName": "홍길동",
  "projectTitle": "웹사이트 개발",
  "message": "새로운 제안이 도착했습니다.",
  "actionUrl": "https://feezero.com/projects/123",
  "actionText": "제안 보기",
  "language": "ko"
}
\`\`\`

#### 지원 언어
- `ko` - 한국어
- `en` - 영어
- `zh` - 중국어
- `ja` - 일본어

---

### 2. 결제 (Coinbase Commerce)

#### 결제 생성

**엔드포인트**: `POST /api/payment/create`

**요청**:
\`\`\`json
{
  "projectId": "proj-123",
  "userId": "user-456",
  "amount": 1000,
  "currency": "USD",
  "projectTitle": "웹사이트 개발 프로젝트"
}
\`\`\`

**응답**:
\`\`\`json
{
  "success": true,
  "data": {
    "chargeId": "charge-789",
    "chargeCode": "ABC123",
    "paymentUrl": "https://commerce.coinbase.com/charges/ABC123",
    "amount": "1000.00",
    "currency": "USD"
  }
}
\`\`\`

#### 결제 상태 조회

**엔드포인트**: `GET /api/payment/:chargeId`

**응답**:
\`\`\`json
{
  "success": true,
  "data": {
    "id": "charge-789",
    "code": "ABC123",
    "pricing": {
      "local": { "amount": "1000.00", "currency": "USD" }
    },
    "addresses": {
      "ethereum": "0x..."
    }
  }
}
\`\`\`

#### Webhook 처리

**엔드포인트**: `POST /api/payment/webhook`

Coinbase Commerce가 결제 이벤트를 이 엔드포인트로 전송합니다.

**이벤트 타입**:
- `charge:created` - 결제 생성됨
- `charge:confirmed` - 결제 확인됨 ✅
- `charge:failed` - 결제 실패 ❌
- `charge:pending` - 결제 대기 중 ⏳

---

### 3. AI (OpenAI)

#### 프로젝트 견적 생성

**엔드포인트**: `POST /api/ai/estimate`

**요청**:
\`\`\`json
{
  "projectDescription": "쇼핑몰 웹사이트를 만들고 싶습니다.",
  "requirements": [
    "상품 등록 및 관리",
    "장바구니 기능",
    "결제 시스템 연동",
    "회원 관리"
  ],
  "language": "ko"
}
\`\`\`

**응답**:
\`\`\`json
{
  "success": true,
  "data": {
    "estimate": {
      "features": [...],
      "difficulty_scores": {...},
      "estimated_hours": 320,
      "budget_range": { "min": 5000, "max": 8000 },
      "risk_factors": [...],
      "tech_stack": [...]
    },
    "usage": {
      "total_tokens": 1250
    }
  }
}
\`\`\`

#### 일정 지연 분석

**엔드포인트**: `POST /api/ai/analyze-delay`

**요청**:
\`\`\`json
{
  "projectTitle": "쇼핑몰 개발",
  "originalDeadline": "2024-12-31",
  "currentProgress": 45,
  "remainingDays": 30,
  "language": "ko"
}
\`\`\`

**응답**:
\`\`\`json
{
  "success": true,
  "data": {
    "analysis": {
      "risk_level": "medium",
      "completion_probability": 65,
      "recommendations": [...],
      "estimated_extra_days": 15,
      "summary": "현재 진행 속도로는..."
    }
  }
}
\`\`\`

#### 요구사항 명확화

**엔드포인트**: `POST /api/ai/clarify-requirements`

**요청**:
\`\`\`json
{
  "requirement": "사용자가 편하게 쓸 수 있는 쇼핑몰",
  "language": "ko"
}
\`\`\`

#### 코드 리뷰

**엔드포인트**: `POST /api/ai/review-code`

**요청**:
\`\`\`json
{
  "code": "function add(a, b) { return a + b }",
  "language": "javascript",
  "reviewLanguage": "ko"
}
\`\`\`

**지원 언어**: `javascript`, `typescript`, `python`, `java`, `go`

---

### 4. 인증 (Auth0)

#### 현재 사용자 정보

**엔드포인트**: `GET /api/auth/me`

**헤더**:
\`\`\`
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
\`\`\`

**응답**:
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "sub": "auth0|123456",
      "email": "user@example.com",
      "name": "홍길동",
      "picture": "https://..."
    }
  }
}
\`\`\`

#### 프로필 업데이트

**엔드포인트**: `POST /api/auth/update-profile`

**요청**:
\`\`\`json
{
  "metadata": {
    "phone": "010-1234-5678",
    "bio": "프리랜서 개발자입니다."
  }
}
\`\`\`

#### 역할 확인

**엔드포인트**: `GET /api/auth/check-role/:role`

**예시**: `GET /api/auth/check-role/admin`

#### 권한 확인

**엔드포인트**: `GET /api/auth/check-permission/:permission`

**예시**: `GET /api/auth/check-permission/project:create`

#### 사용 가능한 역할

**엔드포인트**: `GET /api/auth/roles`

**응답**:
\`\`\`json
{
  "success": true,
  "data": {
    "roles": ["admin", "client", "developer", "moderator"]
  }
}
\`\`\`

#### 사용 가능한 권한

**엔드포인트**: `GET /api/auth/permissions`

**응답**:
\`\`\`json
{
  "success": true,
  "data": {
    "permissions": [
      "project:create",
      "project:read",
      "project:update",
      "project:delete",
      "proposal:create",
      "payment:create",
      ...
    ]
  }
}
\`\`\`

---

## 보안 가이드

### ⚠️ 중요 사항

1. **API 키를 절대 프론트엔드에 노출하지 마세요**
   ```javascript
   // ❌ 잘못된 예시 - 프론트엔드
   const apiKey = 'sk-proj-xxxx';
   
   // ✅ 올바른 예시 - 백엔드 (Hono)
   const apiKey = c.env.OPENAI_API_KEY;
   ```

2. **모든 제3자 API는 Hono 백엔드를 통해서만 호출**
   ```
   프론트엔드 → /api/email → Resend API ✅
   프론트엔드 → Resend API 직접 호출 ❌
   ```

3. **`.dev.vars` 파일을 절대 Git에 커밋하지 마세요**
   - 이미 `.gitignore`에 포함되어 있습니다
   - 실수로 커밋하지 않도록 주의하세요

4. **프로덕션에서는 Cloudflare Secrets 사용**
   - 환경 변수가 안전하게 암호화됩니다
   - 배포 시 자동으로 주입됩니다

---

## 테스트

### 테스트 모드

실제 API 키가 없어도 모든 기능을 테스트할 수 있습니다:

\`\`\`bash
# .dev.vars 파일의 test_key 값으로 테스트
npm run dev:sandbox
\`\`\`

테스트 모드에서는:
- 이메일이 실제로 발송되지 않지만 로그에 출력됨
- 결제가 생성되지 않지만 테스트 데이터 반환
- AI 응답이 더미 데이터로 반환됨
- 인증이 테스트 사용자로 처리됨

### 프로덕션 모드

실제 API 키를 설정하면 자동으로 프로덕션 모드로 전환:

\`\`\`bash
# .dev.vars에 실제 API 키 입력
RESEND_API_KEY=re_실제키입력
OPENAI_API_KEY=sk-proj-실제키입력
...

# 서버 재시작
pm2 restart feezero
\`\`\`

---

## 문제 해결

### 이메일이 발송되지 않음
1. Resend API 키가 올바른지 확인
2. 발신 도메인이 Resend에 등록되어 있는지 확인
3. API 키 권한에 "Sending access"가 있는지 확인

### 결제 Webhook이 작동하지 않음
1. Coinbase Commerce에서 Webhook URL 설정 확인
2. Webhook Secret이 올바른지 확인
3. HTTPS로만 작동하므로 로컬 테스트 시 ngrok 등 사용

### AI 응답이 느림
1. `OPENAI_MAX_TOKENS` 값을 줄여보세요 (기본 2000)
2. `gpt-4o-mini` 모델 사용 (더 빠르고 저렴)
3. 요청이 너무 복잡하지 않은지 확인

### 인증 오류
1. Auth0 Domain이 올바른지 확인 (예: `your-tenant.auth0.com`)
2. JWT 토큰이 만료되지 않았는지 확인
3. Authorization 헤더 형식: `Bearer <token>`

---

## 추가 정보

각 서비스의 자세한 문서:
- **Resend**: https://resend.com/docs
- **Coinbase Commerce**: https://docs.cloud.coinbase.com/commerce/docs
- **OpenAI**: https://platform.openai.com/docs
- **Auth0**: https://auth0.com/docs

질문이나 문제가 있으면 이슈를 등록해주세요!
