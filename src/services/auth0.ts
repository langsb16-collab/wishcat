/**
 * 🔐 Auth0 Authentication Service
 * 
 * 사용자 인증 및 권한 관리
 * - JWT 토큰 검증
 * - 사용자 정보 조회
 * - 권한 확인
 * 
 * @see https://auth0.com/docs/api/authentication
 */

export interface Auth0Config {
  domain: string;
  clientId: string;
  clientSecret: string;
  audience: string;
}

export interface Auth0User {
  sub: string; // User ID
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  nickname?: string;
  [key: string]: any;
}

export interface TokenResponse {
  success: boolean;
  user?: Auth0User;
  error?: string;
}

/**
 * JWT 토큰 검증 및 사용자 정보 추출
 */
export async function verifyToken(
  token: string,
  config: Auth0Config
): Promise<TokenResponse> {
  try {
    // 테스트 모드
    if (config.domain.includes('your-tenant')) {
      console.log('🔐 [DEV MODE] Token would be verified');
      return {
        success: true,
        user: {
          sub: 'auth0|test-user-' + Date.now(),
          email: 'test@feezero.com',
          email_verified: true,
          name: 'Test User',
          picture: 'https://via.placeholder.com/150'
        }
      };
    }

    // Auth0 UserInfo 엔드포인트 호출
    const response = await fetch(`https://${config.domain}/userinfo`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Auth0 API error: ${error}`);
    }

    const user = await response.json();
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Failed to verify token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Management API 액세스 토큰 발급
 */
export async function getManagementToken(
  config: Auth0Config
): Promise<{ token?: string; error?: string }> {
  try {
    // 테스트 모드
    if (config.domain.includes('your-tenant')) {
      console.log('🔐 [DEV MODE] Management token would be issued');
      return { token: 'test-management-token-' + Date.now() };
    }

    const response = await fetch(`https://${config.domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        audience: `https://${config.domain}/api/v2/`,
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Auth0 API error: ${error}`);
    }

    const data = await response.json();
    return { token: data.access_token };
  } catch (error) {
    console.error('Failed to get management token:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 사용자 메타데이터 업데이트 (Management API)
 */
export async function updateUserMetadata(
  config: Auth0Config,
  userId: string,
  metadata: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    // 테스트 모드
    if (config.domain.includes('your-tenant')) {
      console.log('🔐 [DEV MODE] User metadata would be updated:', { userId, metadata });
      return { success: true };
    }

    // Management Token 발급
    const { token, error } = await getManagementToken(config);
    if (error) {
      throw new Error(error);
    }

    const response = await fetch(
      `https://${config.domain}/api/v2/users/${encodeURIComponent(userId)}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_metadata: metadata
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Auth0 API error: ${error}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to update user metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 사용자 역할 확인
 */
export function hasRole(user: Auth0User, role: string): boolean {
  const roles = user['https://feezero.com/roles'] || user.roles || [];
  return Array.isArray(roles) && roles.includes(role);
}

/**
 * 사용자 권한 확인
 */
export function hasPermission(user: Auth0User, permission: string): boolean {
  const permissions = user['https://feezero.com/permissions'] || user.permissions || [];
  return Array.isArray(permissions) && permissions.includes(permission);
}

/**
 * JWT 토큰에서 Bearer 제거
 */
export function extractToken(authHeader: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Hono 미들웨어용 인증 헬퍼
 */
export async function authenticateRequest(
  authHeader: string | undefined,
  config: Auth0Config
): Promise<{ authenticated: boolean; user?: Auth0User; error?: string }> {
  if (!authHeader) {
    return {
      authenticated: false,
      error: 'No authorization header'
    };
  }

  const token = extractToken(authHeader);
  if (!token) {
    return {
      authenticated: false,
      error: 'Invalid authorization header format'
    };
  }

  const result = await verifyToken(token, config);
  if (!result.success) {
    return {
      authenticated: false,
      error: result.error
    };
  }

  return {
    authenticated: true,
    user: result.user
  };
}

/**
 * 역할 기반 접근 제어 (RBAC) 헬퍼
 */
export function checkAccess(
  user: Auth0User,
  requiredRole?: string,
  requiredPermission?: string
): { allowed: boolean; reason?: string } {
  // 역할 확인
  if (requiredRole && !hasRole(user, requiredRole)) {
    return {
      allowed: false,
      reason: `Required role: ${requiredRole}`
    };
  }

  // 권한 확인
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return {
      allowed: false,
      reason: `Required permission: ${requiredPermission}`
    };
  }

  return { allowed: true };
}

/**
 * FeeZero 전용 역할 정의
 */
export const FeeZeroRoles = {
  ADMIN: 'admin',
  CLIENT: 'client',
  DEVELOPER: 'developer',
  MODERATOR: 'moderator'
} as const;

/**
 * FeeZero 전용 권한 정의
 */
export const FeeZeroPermissions = {
  // 프로젝트
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  
  // 제안
  PROPOSAL_CREATE: 'proposal:create',
  PROPOSAL_READ: 'proposal:read',
  PROPOSAL_ACCEPT: 'proposal:accept',
  
  // 결제
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_READ: 'payment:read',
  
  // 관리자
  ADMIN_ACCESS: 'admin:access',
  USER_MANAGE: 'user:manage'
} as const;
