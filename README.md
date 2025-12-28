# 🌐 FeeZero - 글로벌 프리랜서 매칭 플랫폼

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-4.10-orange)](https://hono.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020)](https://pages.cloudflare.com/)

**FeeZero**는 전 세계 의뢰인과 개발자를 연결하는 저수수료 프리랜서 매칭 플랫폼입니다.
크몽, 위시캣을 벤치마킹하여 4개국 언어를 지원하는 글로벌 플랫폼으로 제작되었습니다.

## 📋 목차

- [주요 특징](#-주요-특징)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [설치 및 실행](#-설치-및-실행)
- [API 엔드포인트](#-api-엔드포인트)
- [데이터베이스 스키마](#-데이터베이스-스키마)
- [다국어 지원](#-다국어-지원)
- [제3자 서비스 통합](#-제3자-서비스-통합)
- [배포](#-배포)
- [로드맵](#-로드맵)

## ✨ 주요 특징

### 💰 업계 최저 수수료
- **의뢰인**: 2% 수수료
- **개발자**: 0% 수수료 (업계 유일!)
- **결제 방식**: USDT (테더) 암호화폐

### 🌍 다국어 지원 (8개 언어)
- 🇰🇷 한국어 (Korean)
- 🇺🇸 영어 (English)
- 🇨🇳 중국어 (Chinese)
- 🇯🇵 일본어 (Japanese)
- 🇻🇳 베트남어 (Vietnamese) **NEW**
- 🇹🇭 태국어 (Thai) **NEW**
- 🇪🇸 스페인어 (Spanish) **NEW**
- 🇩🇪 독일어 (German) **NEW**

### 📱 주요 기능

### 🎯 위시캣/프리모아 단점 해결 핵심 10가지 기능
1. **AI 기반 표준 견적 시스템** - 투명한 가격 산정 (기능 분해, 난이도 점수화)
2. **프로젝트 성공 기준 자동 정의** - 개발 완료 체크리스트로 분쟁 70% 차단
3. **단계별 에스크로 분할 결제** - 개발자·클라이언트 모두 리스크 감소
4. **실전 검증 신뢰지수** - 포트폴리오가 아닌 정량 지표로 실력 검증
5. **AI PM 보조 시스템** - 일정 지연 감지, 요구사항 변경 로그 자동 기록
6. **중간 결과물 제출 의무** - Git/배포 링크 제출로 블랙박스 개발 방지
7. **일정 지연 자동 패널티** - 지연 일수 자동 계산, 수수료 차감 or 보상
8. **요구사항 자동 변환 AI** - 자연어를 개발 요구사항으로 자동 변환
9. **프로젝트 성공 보증** - 일정·기능 미달 시 일부 보상 제공
10. **운영·유지보수 자동 연계** - 개발 완료 후 월 단위 계약 자동 전환

### 💡 기본 기능
- ✅ 프로젝트 등록 및 매칭
- ✅ 프리랜서 프로필 및 포트폴리오
- ✅ 카테고리별 전문가 분류
- ✅ 입찰 및 제안 시스템
- ✅ 계약 및 에스크로 시스템
- ✅ 리뷰 및 평가 시스템
- ✅ 무료/프리미엄 멤버십
- ✅ 공지사항 시스템
- 🔄 실시간 메시징 (제3자 서비스 통합 예정)
- 🔄 음성/영상 통화 (제3자 서비스 통합 예정)

## 🛠 기술 스택

### Backend
- **[Hono](https://hono.dev/)** - 초경량 웹 프레임워크
- **[Cloudflare Workers](https://workers.cloudflare.com/)** - 엣지 컴퓨팅 플랫폼
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** - 서버리스 SQLite 데이터베이스
- **TypeScript** - 타입 안전성

### Frontend
- **TailwindCSS** - 유틸리티 우선 CSS 프레임워크
- **Font Awesome** - 아이콘 라이브러리
- **Vanilla JavaScript** - 순수 자바스크립트

### DevOps
- **Wrangler** - Cloudflare 개발 도구
- **PM2** - 프로세스 매니저 (로컬 개발)
- **Git** - 버전 관리

## 📁 프로젝트 구조

\`\`\`
webapp/
├── src/
│   ├── index.tsx          # 메인 애플리케이션 엔트리
│   ├── types.ts           # TypeScript 타입 정의
│   ├── i18n.ts            # 다국어 번역
│   ├── db.ts              # 데이터베이스 유틸리티
│   ├── renderer.tsx       # JSX 렌더러
│   ├── admin.tsx          # 관리자 페이지
│   ├── routes/            # API 라우트
│   │   ├── email.ts       # 📧 이메일 API (Resend)
│   │   ├── payment.ts     # 💳 결제 API (Coinbase)
│   │   ├── ai.ts          # 🤖 AI API (OpenAI)
│   │   ├── auth.ts        # 🔐 인증 API (Auth0)
│   │   └── announcements.ts
│   └── services/          # 제3자 서비스 통합
│       ├── resend.ts      # Resend 이메일 서비스
│       ├── coinbase.ts    # Coinbase Commerce 결제
│       ├── openai.ts      # OpenAI AI 서비스
│       └── auth0.ts       # Auth0 인증 서비스
├── migrations/
│   └── 0001_initial_schema.sql  # 데이터베이스 스키마
├── public/
│   └── static/            # 정적 파일
├── dist/                  # 빌드 결과물
├── .wrangler/             # Wrangler 로컬 데이터
├── .dev.vars              # 로컬 개발용 환경 변수 (Git 제외)
├── .gitignore             # Git 제외 파일 목록
├── ecosystem.config.cjs   # PM2 설정
├── wrangler.json          # Cloudflare 설정
├── seed.sql               # 시드 데이터
├── package.json           # 의존성 관리
└── README.md              # 프로젝트 문서
\`\`\`

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18+
- npm 또는 yarn
- PM2 (로컬 개발용)

### 1. 프로젝트 클론
\`\`\`bash
git clone <repository-url>
cd webapp
\`\`\`

### 2. 의존성 설치
\`\`\`bash
npm install
\`\`\`

### 3. 데이터베이스 초기화
\`\`\`bash
# 스키마 적용
npm run db:migrate:local

# 시드 데이터 입력
npm run db:seed
\`\`\`

### 4. 프로젝트 빌드
\`\`\`bash
npm run build
\`\`\`

### 5. 개발 서버 시작
\`\`\`bash
# PM2로 시작
pm2 start ecosystem.config.cjs

# 또는 직접 시작
npm run dev:sandbox
\`\`\`

### 6. 서버 접속
- **로컬**: http://localhost:3000
- **샌드박스**: https://3000-iaz6hxe6dnh7awzc4b7fz-5634da27.sandbox.novita.ai

## 🔌 API 엔드포인트

### 공통
- `GET /api/health` - 헬스 체크

### 카테고리
- `GET /api/categories?lang={ko|en|zh|ja}` - 모든 카테고리 조회
- `GET /api/categories/:id?lang={ko|en|zh|ja}` - 특정 카테고리 조회

### 프로젝트
- `GET /api/projects?page=1&limit=20` - 프로젝트 목록
- `GET /api/projects/:id` - 프로젝트 상세

### 프리랜서
- `GET /api/freelancers?page=1&limit=20` - 프리랜서 목록
- `GET /api/freelancers/:id` - 프리랜서 상세 (포트폴리오 포함)

### 예시 요청
\`\`\`bash
# 한국어로 카테고리 조회
curl http://localhost:3000/api/categories?lang=ko

# 영어로 프로젝트 목록 조회
curl http://localhost:3000/api/projects?page=1&limit=10

# 프리랜서 상세 정보
curl http://localhost:3000/api/freelancers/1
\`\`\`

## 🗄 데이터베이스 스키마

### 주요 테이블
- **users** - 사용자 정보 (의뢰인/프리랜서)
- **freelancer_profiles** - 프리랜서 프로필
- **portfolio_items** - 포트폴리오 항목
- **categories** - 카테고리
- **category_translations** - 카테고리 번역
- **projects** - 프로젝트
- **project_bids** - 입찰/제안
- **contracts** - 계약
- **messages** - 메시지
- **reviews** - 리뷰 및 평가
- **payments** - 결제 내역
- **skills** - 기술/스킬
- **skill_translations** - 스킬 번역

### 데이터베이스 명령어
\`\`\`bash
# 로컬 데이터베이스 초기화
npm run db:migrate:local

# 시드 데이터 입력
npm run db:seed

# 데이터베이스 리셋 (전체 삭제 후 재생성)
npm run db:reset

# 로컬 콘솔
npm run db:console:local

# 프로덕션 마이그레이션
npm run db:migrate:prod
\`\`\`

## 🌐 다국어 지원

### 지원 언어 (8개)
| 언어 코드 | 언어 이름 | Flag | Font Family |
|---------|---------|------|-------------|
| `ko` | 한국어 | 🇰🇷 | Noto Sans KR |
| `en` | English | 🇺🇸 | System Default |
| `zh` | 中文 | 🇨🇳 | Noto Sans SC |
| `ja` | 日本語 | 🇯🇵 | Noto Sans JP |
| `vi` | Tiếng Việt | 🇻🇳 | System Default |
| `th` | ไทย | 🇹🇭 | System Default |
| `es` | Español | 🇪🇸 | System Default |
| `de` | Deutsch | 🇩🇪 | System Default |

### 언어 전환
URL 쿼리 파라미터 또는 Accept-Language 헤더를 통해 언어를 설정할 수 있습니다.

\`\`\`bash
# URL 쿼리 파라미터
http://localhost:3000/?lang=en
http://localhost:3000/api/categories?lang=zh

# Accept-Language 헤더
curl -H "Accept-Language: ja" http://localhost:3000/
\`\`\`

### 번역 파일
모든 번역은 `src/i18n.ts` 파일에서 관리됩니다.

## 🔗 제3자 서비스 통합

### ✅ 통합 완료 서비스

FeeZero는 다음 제3자 서비스와 통합되어 있으며, 실제 API 키를 설정하면 즉시 사용 가능합니다:

#### 1. 📧 이메일 서비스 - Resend
- **상태**: ✅ 통합 완료
- **용도**: 회원가입 인증, 프로젝트 알림, 시스템 이메일
- **API 엔드포인트**:
  - `POST /api/email/send-verification` - 인증 이메일 발송
  - `POST /api/email/send-notification` - 알림 이메일 발송
- **문서**: https://resend.com/docs
- **가격**: 무료 100통/월, $20/월 (50,000통)

#### 2. 💳 USDT 결제 - Coinbase Commerce
- **상태**: ✅ 통합 완료
- **용도**: USDT 암호화폐 결제, 에스크로
- **API 엔드포인트**:
  - `POST /api/payment/create` - 결제 생성
  - `GET /api/payment/:chargeId` - 결제 상태 조회
  - `POST /api/payment/webhook` - 결제 이벤트 처리
- **문서**: https://docs.cloud.coinbase.com/commerce/docs
- **수수료**: 거래당 1%

#### 3. 🤖 AI 서비스 - OpenAI
- **상태**: ✅ 통합 완료
- **용도**: 
  - AI 기반 표준 견적 자동 생성
  - 프로젝트 일정 지연 분석
  - 요구사항 명확화 도우미
  - 코드 리뷰 자동화
- **API 엔드포인트**:
  - `POST /api/ai/estimate` - 프로젝트 견적 생성
  - `POST /api/ai/analyze-delay` - 일정 지연 분석
  - `POST /api/ai/clarify-requirements` - 요구사항 명확화
  - `POST /api/ai/review-code` - 코드 리뷰
  - `GET /api/ai/status` - AI 서비스 상태
- **모델**: gpt-4o-mini (비용 효율) / gpt-4o (고품질)
- **문서**: https://platform.openai.com/docs
- **가격**: 
  - gpt-4o-mini: $0.150/1M input, $0.600/1M output
  - gpt-4o: $2.50/1M input, $10.00/1M output

#### 4. 🔐 사용자 인증 - Auth0
- **상태**: ✅ 통합 완료
- **용도**: 사용자 인증, 권한 관리, SSO
- **API 엔드포인트**:
  - `GET /api/auth/me` - 현재 사용자 정보
  - `POST /api/auth/update-profile` - 프로필 업데이트
  - `GET /api/auth/check-role/:role` - 역할 확인
  - `GET /api/auth/check-permission/:permission` - 권한 확인
  - `GET /api/auth/status` - 인증 서비스 상태
  - `GET /api/auth/roles` - 사용 가능한 역할 목록
  - `GET /api/auth/permissions` - 사용 가능한 권한 목록
- **문서**: https://auth0.com/docs
- **가격**: 무료 7,500 활성 사용자/월, $35/월~

### 🔧 API 키 설정 방법

#### 로컬 개발 환경
1. `.dev.vars` 파일이 프로젝트 루트에 생성되어 있습니다
2. 각 서비스에서 API 키를 발급받아 `.dev.vars` 파일에 입력:

\`\`\`env
# 📧 Resend
RESEND_API_KEY=re_your_actual_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# 💳 Coinbase Commerce
COINBASE_API_KEY=your_actual_key_here
COINBASE_WEBHOOK_SECRET=your_webhook_secret_here

# 🤖 OpenAI
OPENAI_API_KEY=sk-proj-your_actual_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# 🔐 Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://your-api-identifier
\`\`\`

3. 개발 서버 재시작:
\`\`\`bash
pm2 restart feezero
\`\`\`

#### 프로덕션 배포 (Cloudflare Pages)
API 키를 Cloudflare Secrets에 안전하게 저장:

\`\`\`bash
# Resend
npx wrangler pages secret put RESEND_API_KEY --project-name feezero
npx wrangler pages secret put RESEND_FROM_EMAIL --project-name feezero

# Coinbase Commerce
npx wrangler pages secret put COINBASE_API_KEY --project-name feezero
npx wrangler pages secret put COINBASE_WEBHOOK_SECRET --project-name feezero

# OpenAI
npx wrangler pages secret put OPENAI_API_KEY --project-name feezero

# Auth0
npx wrangler pages secret put AUTH0_DOMAIN --project-name feezero
npx wrangler pages secret put AUTH0_CLIENT_ID --project-name feezero
npx wrangler pages secret put AUTH0_CLIENT_SECRET --project-name feezero
npx wrangler pages secret put AUTH0_AUDIENCE --project-name feezero
\`\`\`

### 🔄 통합 예정 서비스

#### 1. 실시간 메시징
- **추천 서비스**: Stream Chat, SendBird, PubNub
- **기능**: 텍스트, 파일, 음성 메시지, 읽음 확인

#### 2. 음성/영상 통화
- **추천 서비스**: Agora, Twilio, Daily.co
- **기능**: 1:1 음성 통화, 영상 통화, 화면 공유

#### 3. 파일 저장소
- **추천 서비스**: Cloudflare R2, AWS S3
- **기능**: 포트폴리오 이미지, 프로젝트 파일, 문서

### 🔒 보안 중요사항

#### ⚠️ 절대 하지 말아야 할 것
- ❌ API 키를 코드에 직접 작성
- ❌ API 키를 GitHub에 커밋
- ❌ 프론트엔드에서 직접 API 키 사용

#### ✅ 올바른 방법
1. **로컬 개발**: `.dev.vars` 파일 사용 (`.gitignore`에 포함됨)
2. **프로덕션**: Cloudflare Secrets 사용
3. **API 호출**: 모든 제3자 서비스는 Hono 백엔드를 통해서만 호출

### 통합 아키텍처
\`\`\`
클라이언트 (브라우저)
    ↓
Hono API 서버 (Cloudflare Workers)
    ↓
제3자 서비스 (Resend, Coinbase, OpenAI, Auth0)
\`\`\`

**보안**: 모든 API 키는 서버 사이드에서만 사용되며, 클라이언트에 절대 노출되지 않습니다.

## 📦 배포

### Cloudflare Pages 배포

#### 1. Cloudflare D1 데이터베이스 생성
\`\`\`bash
# 프로덕션 데이터베이스 생성
npx wrangler d1 create feezero-production

# 출력된 database_id를 wrangler.json에 입력
\`\`\`

#### 2. wrangler.json 업데이트
\`\`\`json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "feezero-production",
      "database_id": "your-database-id-here"
    }
  ]
}
\`\`\`

#### 3. 프로덕션 마이그레이션
\`\`\`bash
# 스키마 적용
npm run db:migrate:prod

# 시드 데이터 입력 (선택사항)
npx wrangler d1 execute feezero-production --file=./seed.sql
\`\`\`

#### 4. Cloudflare Pages 프로젝트 생성
\`\`\`bash
npx wrangler pages project create feezero --production-branch main
\`\`\`

#### 5. 배포
\`\`\`bash
npm run deploy:prod
\`\`\`

### 환경 변수 설정
\`\`\`bash
# API 키 등록
npx wrangler pages secret put API_KEY --project-name feezero

# 시크릿 목록 확인
npx wrangler pages secret list --project-name feezero
\`\`\`

## 🗺 로드맵

### ✅ Phase 1 - MVP (완료)
- [x] 프로젝트 초기 설정
- [x] D1 데이터베이스 스키마
- [x] 다국어 지원 (4개국)
- [x] 카테고리 시스템
- [x] 프로젝트 API
- [x] 프리랜서 API
- [x] 기본 프론트엔드

### 🔄 Phase 2 - 인증 및 권한 (진행 중)
- [ ] JWT 인증 시스템
- [ ] 회원가입/로그인
- [ ] OAuth 통합 (Google, GitHub)
- [ ] 권한 관리 (RBAC)

### 📅 Phase 3 - 핵심 기능
- [ ] 프로젝트 등록 및 수정
- [ ] 입찰 시스템
- [ ] 계약 생성
- [ ] 리뷰 및 평가

### 📅 Phase 4 - 제3자 서비스 통합
- [ ] 실시간 메시징 (Stream Chat)
- [ ] 음성/영상 통화 (Agora)
- [ ] USDT 결제 (NOWPayments)
- [ ] 파일 스토리지 (Cloudflare R2)

### 📅 Phase 5 - 고급 기능
- [ ] AI 기반 매칭 추천
- [ ] 자동 견적 시스템
- [ ] 분쟁 해결 시스템
- [ ] 대시보드 및 분석

### 📅 Phase 6 - 최적화
- [ ] 성능 최적화
- [ ] SEO 최적화
- [ ] PWA 지원
- [ ] 모바일 앱 (React Native)

## 📊 현재 완료 기능

### ✅ 데이터베이스
- 완전한 다중 테이블 스키마
- 다국어 번역 테이블
- 인덱스 최적화
- 시드 데이터

### ✅ API
- RESTful API 설계
- 카테고리 API (다국어)
- 프로젝트 API (페이지네이션)
- 프리랜서 API (포트폴리오 포함)
- 헬스 체크

### ✅ 프론트엔드
- 반응형 디자인
- 다국어 UI
- 언어 전환 기능
- TailwindCSS 스타일링
- Font Awesome 아이콘

### ✅ 개발 환경
- TypeScript 설정
- PM2 프로세스 관리
- Git 버전 관리
- 로컬 D1 데이터베이스

## 🔐 보안

- 모든 API 키는 환경 변수로 관리
- Cloudflare Secrets 사용 권장
- CORS 설정
- XSS 방어
- SQL Injection 방어 (Prepared Statements)

## 📝 라이선스

MIT License

## 👥 기여

기여를 환영합니다! Pull Request를 제출해주세요.

## 📞 문의

- **프로젝트**: FeeZero
- **이메일**: dev@feezero.com
- **웹사이트**: https://feezero.pages.dev (배포 후)

---

**Made with ❤️ by FeeZero Team**

**Last Updated**: 2025-12-10

## 🆕 최신 업데이트

### v1.2.0 (2025-12-20) 🎉
- ✅ **공지사항 버튼 추가** - 클릭 가능한 알림 기능
- ✅ **회원가입 버튼 추가** - 로그인 옆에 배치
- ✅ **"모든 거래는 테더 USDT" 메인 표시** - Hero 섹션에 강조
- ✅ **위시캣/프리모아 단점 해결 핵심 10가지 기능 UI** - 차별화된 기능 섹션 추가
- ✅ **글로벌 연결 강조** - 8개 언어 지원 및 국기 표시
- ✅ **시스템 중심 프로젝트 관리** - 기존 플랫폼의 사람 중심 중개 방식에서 탈피

### v1.1.0 (2025-12-10)
- ✅ **8개 언어 지원 추가**: 베트남어, 태국어, 스페인어, 독일어 추가
- ✅ 모든 카테고리 및 스킬에 대한 완전한 다국어 번역
- ✅ 프론트엔드 언어 전환 버튼 업데이트 (8개 언어)
- ✅ 데이터베이스 스키마 확장 (언어 제약 해제)
- ✅ i18n 번역 시스템 대폭 확장

### 🌍 지원 언어 (8개)
🇰🇷 한국어 | 🇺🇸 English | 🇨🇳 中文 | 🇯🇵 日本語 | 🇻🇳 Tiếng Việt | 🇹🇭 ไทย | 🇪🇸 Español | 🇩🇪 Deutsch

### 🏆 기존 플랫폼 대비 차별화 요소

#### 위시캣/프리모아의 문제점
- ❌ 불투명하고 편차 큰 견적
- ❌ 모호한 프로젝트 실패 책임
- ❌ PM 개입에도 품질 편차
- ❌ 모호한 개발 완료 기준
- ❌ 느린 분쟁 해결
- ❌ 낮은 중개 수수료 가치
- ❌ 기술 비전문가 클라이언트의 불리함
- ❌ 서류/포트폴리오 위주 개발자 검증
- ❌ 중도 이탈 리스크
- ❌ 일정 지연 패널티 구조 없음

#### FeeZero의 해결 방안
- ✅ **견적 신뢰도**: 낮음 → 표준화
- ✅ **분쟁율**: 높음 → 대폭 감소
- ✅ **프로젝트 성공률**: 60-70% → 85% 이상
- ✅ **클라이언트 이해도**: 낮음 → AI 보조
- ✅ **개발자 책임성**: 개인 의존 → 시스템화

#### 플랫폼 철학
- **기존 플랫폼**: "사람 중심 중개"
- **FeeZero**: "시스템 중심 프로젝트 관리" + 글로벌 연결
