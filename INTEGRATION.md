# 🔌 FeeZero 제3자 서비스 통합 가이드

이 문서는 FeeZero 플랫폼에서 고급 기능을 구현하기 위한 제3자 서비스 통합 방법을 안내합니다.

## 📋 목차

- [통합 개요](#통합-개요)
- [실시간 메시징](#1-실시간-메시징)
- [음성/영상 통화](#2-음성영상-통화)
- [USDT 결제](#3-usdt-결제)
- [파일 저장소](#4-파일-저장소)
- [보안 가이드](#보안-가이드)

## 통합 개요

### 아키텍처 원칙

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌──────────────────┐
│   Hono API       │
│ (Cloudflare)     │
└────────┬─────────┘
         │
         ├─────────► Stream Chat API
         ├─────────► Agora API
         ├─────────► NOWPayments API
         └─────────► Cloudflare R2
```

**핵심 원칙**:
1. 클라이언트는 절대 제3자 API에 직접 접근하지 않음
2. 모든 API 키는 Cloudflare Secrets에 저장
3. Hono 미들웨어를 통한 요청 검증
4. 에러 핸들링 및 로깅

---

## 1. 실시간 메시징

### Stream Chat 통합 (추천)

#### 1.1 Stream Chat 계정 생성
1. https://getstream.io/ 방문
2. 무료 계정 생성
3. API Key 및 Secret 획득

#### 1.2 환경 변수 설정
```bash
# Cloudflare Secrets에 추가
npx wrangler pages secret put STREAM_API_KEY --project-name feezero
npx wrangler pages secret put STREAM_API_SECRET --project-name feezero
```

#### 1.3 Hono API 구현

**src/routes/chat.ts**
```typescript
import { Hono } from 'hono'
import type { Bindings } from '../types'

const chat = new Hono<{ Bindings: Bindings }>()

// Stream Chat 토큰 생성
chat.post('/api/chat/token', async (c) => {
  const { userId } = await c.req.json()
  const { STREAM_API_KEY, STREAM_API_SECRET } = c.env
  
  // Stream Chat SDK를 사용하여 토큰 생성
  // (실제 구현 시 stream-chat 패키지 사용)
  const token = generateStreamToken(userId, STREAM_API_SECRET)
  
  return c.json({
    success: true,
    data: {
      token,
      apiKey: STREAM_API_KEY,
      userId
    }
  })
})

// 채널 생성
chat.post('/api/chat/channel', async (c) => {
  const { type, id, members } = await c.req.json()
  const { STREAM_API_KEY, STREAM_API_SECRET } = c.env
  
  // Stream Chat API 호출
  const response = await fetch('https://chat.stream-io-api.com/channels', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': STREAM_API_KEY,
      'Stream-Auth-Type': 'jwt'
    },
    body: JSON.stringify({ type, id, members })
  })
  
  const result = await response.json()
  return c.json(result)
})

export default chat
```

#### 1.4 클라이언트 구현

**public/static/chat.js**
```javascript
// Stream Chat 클라이언트 초기화
async function initChat(userId) {
  // 서버에서 토큰 받기
  const response = await fetch('/api/chat/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
  
  const { token, apiKey } = await response.json()
  
  // Stream Chat 클라이언트 초기화
  const client = StreamChat.getInstance(apiKey)
  await client.connectUser({ id: userId }, token)
  
  return client
}

// 채널 생성 및 참여
async function joinChannel(client, channelId, members) {
  const channel = client.channel('messaging', channelId, {
    members: members
  })
  
  await channel.watch()
  return channel
}
```

#### 1.5 메시지 테이블 동기화
Stream Chat에서 발생한 메시지를 D1 데이터베이스에도 저장:

```typescript
// Webhook 핸들러
chat.post('/api/webhooks/stream', async (c) => {
  const event = await c.req.json()
  const { DB } = c.env
  
  if (event.type === 'message.new') {
    await DB.prepare(`
      INSERT INTO messages (conversation_id, sender_id, receiver_id, message_content, third_party_message_id)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      event.channel_id,
      event.user.id,
      event.receiver_id,
      event.message.text,
      event.message.id
    ).run()
  }
  
  return c.json({ success: true })
})
```

---

## 2. 음성/영상 통화

### Agora 통합 (추천)

#### 2.1 Agora 계정 생성
1. https://www.agora.io/ 방문
2. 무료 계정 생성 (월 10,000분 무료)
3. App ID 및 App Certificate 획득

#### 2.2 환경 변수 설정
```bash
npx wrangler pages secret put AGORA_APP_ID --project-name feezero
npx wrangler pages secret put AGORA_APP_CERTIFICATE --project-name feezero
```

#### 2.3 Hono API 구현

**src/routes/call.ts**
```typescript
import { Hono } from 'hono'
import type { Bindings } from '../types'

const call = new Hono<{ Bindings: Bindings }>()

// Agora 토큰 생성
call.post('/api/call/token', async (c) => {
  const { channelName, userId, role } = await c.req.json()
  const { AGORA_APP_ID, AGORA_APP_CERTIFICATE } = c.env
  
  // Agora RTC Token 생성
  // (agora-access-token 패키지 사용)
  const token = generateAgoraToken(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channelName,
    userId,
    role
  )
  
  return c.json({
    success: true,
    data: {
      token,
      appId: AGORA_APP_ID,
      channelName,
      userId
    }
  })
})

// 통화 시작
call.post('/api/call/start', async (c) => {
  const { callerId, receiverId, callType } = await c.req.json()
  const { DB } = c.env
  
  // D1에 통화 기록 저장
  await DB.prepare(`
    INSERT INTO call_logs (caller_id, receiver_id, call_type, status)
    VALUES (?, ?, ?, 'initiated')
  `).bind(callerId, receiverId, callType).run()
  
  return c.json({ success: true })
})

export default call
```

#### 2.4 클라이언트 구현

**public/static/call.js**
```javascript
// Agora 클라이언트 초기화
async function initCall(userId) {
  const response = await fetch('/api/call/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channelName: 'call_' + Date.now(),
      userId: userId,
      role: 'host'
    })
  })
  
  const { token, appId, channelName } = await response.json()
  
  // Agora RTC 클라이언트 생성
  const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
  
  await client.join(appId, channelName, token, userId)
  
  return client
}

// 음성 통화 시작
async function startVoiceCall(client) {
  const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
  await client.publish([localAudioTrack])
}

// 영상 통화 시작
async function startVideoCall(client) {
  const localVideoTrack = await AgoraRTC.createCameraVideoTrack()
  const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
  await client.publish([localVideoTrack, localAudioTrack])
  
  // 비디오 표시
  localVideoTrack.play('local-video')
}
```

---

## 3. USDT 결제

### NOWPayments 통합 (추천)

#### 3.1 NOWPayments 계정 생성
1. https://nowpayments.io/ 방문
2. 비즈니스 계정 생성
3. API Key 획득
4. USDT 지갑 주소 설정

#### 3.2 환경 변수 설정
```bash
npx wrangler pages secret put NOWPAYMENTS_API_KEY --project-name feezero
npx wrangler pages secret put NOWPAYMENTS_IPN_SECRET --project-name feezero
```

#### 3.3 Hono API 구현

**src/routes/payment.ts**
```typescript
import { Hono } from 'hono'
import type { Bindings } from '../types'

const payment = new Hono<{ Bindings: Bindings }>()

// 결제 생성
payment.post('/api/payment/create', async (c) => {
  const { amount, contractId, userId } = await c.req.json()
  const { NOWPAYMENTS_API_KEY, DB } = c.env
  
  // NOWPayments API 호출
  const response = await fetch('https://api.nowpayments.io/v1/payment', {
    method: 'POST',
    headers: {
      'x-api-key': NOWPAYMENTS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: 'usdttrc20',
      order_id: \`contract_\${contractId}\`,
      order_description: \`FeeZero Contract #\${contractId}\`
    })
  })
  
  const result = await response.json()
  
  // D1에 결제 기록 저장
  await DB.prepare(`
    INSERT INTO payments (contract_id, user_id, payment_type, amount, third_party_payment_id, status)
    VALUES (?, ?, 'escrow', ?, ?, 'pending')
  `).bind(contractId, userId, amount, result.payment_id).run()
  
  return c.json({
    success: true,
    data: {
      paymentId: result.payment_id,
      payAddress: result.pay_address,
      payAmount: result.pay_amount,
      expiresAt: result.expiration_estimate_date
    }
  })
})

// 결제 상태 확인
payment.get('/api/payment/:paymentId/status', async (c) => {
  const paymentId = c.req.param('paymentId')
  const { NOWPAYMENTS_API_KEY } = c.env
  
  const response = await fetch(\`https://api.nowpayments.io/v1/payment/\${paymentId}\`, {
    headers: { 'x-api-key': NOWPAYMENTS_API_KEY }
  })
  
  const result = await response.json()
  return c.json({ success: true, data: result })
})

// IPN Webhook (결제 완료 알림)
payment.post('/api/webhooks/nowpayments', async (c) => {
  const payload = await c.req.json()
  const { NOWPAYMENTS_IPN_SECRET, DB } = c.env
  
  // IPN 서명 검증
  const signature = c.req.header('x-nowpayments-sig')
  const isValid = verifyIPNSignature(payload, signature, NOWPAYMENTS_IPN_SECRET)
  
  if (!isValid) {
    return c.json({ error: 'Invalid signature' }, 401)
  }
  
  // 결제 상태 업데이트
  if (payload.payment_status === 'finished') {
    await DB.prepare(`
      UPDATE payments 
      SET status = 'completed', txn_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE third_party_payment_id = ?
    `).bind(payload.outcome_txn_hash, payload.payment_id).run()
  }
  
  return c.json({ success: true })
})

export default payment
```

#### 3.4 클라이언트 구현

**public/static/payment.js**
```javascript
// 결제 시작
async function createPayment(amount, contractId) {
  const response = await fetch('/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, contractId, userId: currentUserId })
  })
  
  const { data } = await response.json()
  
  // 결제 UI 표시
  showPaymentModal({
    address: data.payAddress,
    amount: data.payAmount,
    expiresAt: data.expiresAt
  })
  
  // 결제 상태 폴링
  pollPaymentStatus(data.paymentId)
}

// 결제 상태 확인
async function pollPaymentStatus(paymentId) {
  const interval = setInterval(async () => {
    const response = await fetch(\`/api/payment/\${paymentId}/status\`)
    const { data } = await response.json()
    
    if (data.payment_status === 'finished') {
      clearInterval(interval)
      showPaymentSuccess()
    } else if (data.payment_status === 'failed') {
      clearInterval(interval)
      showPaymentError()
    }
  }, 5000) // 5초마다 확인
}
```

---

## 4. 파일 저장소

### Cloudflare R2 통합 (추천)

#### 4.1 R2 버킷 생성
```bash
npx wrangler r2 bucket create feezero-files
```

#### 4.2 wrangler.json 업데이트
```json
{
  "r2_buckets": [
    {
      "binding": "FILES",
      "bucket_name": "feezero-files"
    }
  ]
}
```

#### 4.3 Hono API 구현

**src/routes/upload.ts**
```typescript
import { Hono } from 'hono'
import type { Bindings } from '../types'

const upload = new Hono<{ Bindings: Bindings & { FILES: R2Bucket } }>()

// 파일 업로드
upload.post('/api/upload', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }
  
  // 파일명 생성
  const timestamp = Date.now()
  const fileName = \`\${timestamp}-\${file.name}\`
  const key = \`uploads/\${fileName}\`
  
  // R2에 업로드
  await c.env.FILES.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type
    }
  })
  
  return c.json({
    success: true,
    data: {
      url: \`https://files.feezero.com/\${key}\`,
      key: key,
      size: file.size,
      type: file.type
    }
  })
})

// 파일 다운로드
upload.get('/files/*', async (c) => {
  const key = c.req.param('*')
  const object = await c.env.FILES.get(key)
  
  if (!object) {
    return c.notFound()
  }
  
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000'
    }
  })
})

// 파일 삭제
upload.delete('/api/upload/:key', async (c) => {
  const key = c.req.param('key')
  await c.env.FILES.delete(key)
  
  return c.json({ success: true })
})

export default upload
```

#### 4.4 클라이언트 구현

**public/static/upload.js**
```javascript
// 파일 업로드
async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
  
  const { data } = await response.json()
  return data.url
}

// 이미지 프리뷰
function previewImage(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = document.createElement('img')
    img.src = e.target.result
    document.getElementById('preview').appendChild(img)
  }
  reader.readAsDataURL(file)
}

// 드래그 앤 드롭
function setupDragDrop() {
  const dropZone = document.getElementById('dropzone')
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    dropZone.classList.add('drag-over')
  })
  
  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault()
    dropZone.classList.remove('drag-over')
    
    const files = e.dataTransfer.files
    for (const file of files) {
      const url = await uploadFile(file)
      console.log('Uploaded:', url)
    }
  })
}
```

---

## 보안 가이드

### 1. API 키 관리

**절대 하지 말 것**:
```javascript
// ❌ 클라이언트에 API 키 노출
const STREAM_API_KEY = 'your-api-key'
```

**올바른 방법**:
```bash
# ✅ Cloudflare Secrets 사용
npx wrangler pages secret put STREAM_API_KEY
```

### 2. 요청 검증

```typescript
// 사용자 인증 미들웨어
app.use('/api/*', async (c, next) => {
  const token = c.req.header('Authorization')
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  // JWT 검증
  const user = await verifyToken(token)
  if (!user) {
    return c.json({ error: 'Invalid token' }, 401)
  }
  
  c.set('user', user)
  await next()
})
```

### 3. Rate Limiting

```typescript
// Rate limit 미들웨어
const rateLimiter = new Map()

app.use('/api/*', async (c, next) => {
  const ip = c.req.header('CF-Connecting-IP')
  const key = \`rate_\${ip}\`
  
  const now = Date.now()
  const requests = rateLimiter.get(key) || []
  
  // 최근 1분간의 요청만 유지
  const recentRequests = requests.filter(time => now - time < 60000)
  
  if (recentRequests.length >= 60) {
    return c.json({ error: 'Too many requests' }, 429)
  }
  
  recentRequests.push(now)
  rateLimiter.set(key, recentRequests)
  
  await next()
})
```

### 4. CORS 설정

```typescript
import { cors } from 'hono/cors'

// 프로덕션 도메인만 허용
app.use('/api/*', cors({
  origin: ['https://feezero.com', 'https://www.feezero.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}))
```

### 5. Webhook 서명 검증

```typescript
function verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(JSON.stringify(payload))
  const expectedSignature = hmac.digest('hex')
  
  return signature === expectedSignature
}
```

---

## 비용 예상

### 무료 티어 (초기 단계)

| 서비스 | 무료 한도 | 초과 비용 |
|--------|----------|----------|
| Stream Chat | 100 MAU | $0.50/MAU |
| Agora | 10,000분/월 | $0.99/1000분 |
| NOWPayments | 무제한 | 0.5% 수수료 |
| Cloudflare R2 | 10GB 저장 | $0.015/GB |

### 예상 월 비용 (1,000명 사용자)
- Stream Chat: $50
- Agora: $10
- NOWPayments: 수수료만
- Cloudflare R2: $2
- **총 예상 비용**: ~$62/월

---

## 다음 단계

1. **Phase 1**: 실시간 메시징 통합
2. **Phase 2**: USDT 결제 통합
3. **Phase 3**: 파일 업로드 구현
4. **Phase 4**: 음성/영상 통화 추가

각 단계별로 구현 후 테스트 및 검증을 진행하세요.

---

**문의**: dev@feezero.com
**마지막 업데이트**: 2025-12-10
