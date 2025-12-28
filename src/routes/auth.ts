/**
 * 🔐 Authentication API Routes
 * 
 * Auth0 인증 관련 API 엔드포인트
 */

import { Hono } from 'hono';
import { Bindings } from '../types';
import {
  authenticateRequest,
  checkAccess,
  FeeZeroRoles,
  FeeZeroPermissions,
  updateUserMetadata
} from '../services/auth0';

const auth = new Hono<{ Bindings: Bindings }>();

/**
 * GET /api/auth/me
 * 현재 로그인한 사용자 정보 조회
 */
auth.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    const result = await authenticateRequest(authHeader, {
      domain: c.env.AUTH0_DOMAIN,
      clientId: c.env.AUTH0_CLIENT_ID,
      clientSecret: c.env.AUTH0_CLIENT_SECRET,
      audience: c.env.AUTH0_AUDIENCE
    });

    if (!result.authenticated) {
      return c.json({
        success: false,
        error: result.error || 'Not authenticated'
      }, 401);
    }

    return c.json({
      success: true,
      data: {
        user: result.user
      }
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return c.json({
      success: false,
      error: 'Failed to get user info'
    }, 500);
  }
});

/**
 * POST /api/auth/update-profile
 * 사용자 프로필 업데이트
 */
auth.post('/update-profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    const result = await authenticateRequest(authHeader, {
      domain: c.env.AUTH0_DOMAIN,
      clientId: c.env.AUTH0_CLIENT_ID,
      clientSecret: c.env.AUTH0_CLIENT_SECRET,
      audience: c.env.AUTH0_AUDIENCE
    });

    if (!result.authenticated || !result.user) {
      return c.json({
        success: false,
        error: 'Not authenticated'
      }, 401);
    }

    const { metadata } = await c.req.json();
    
    if (!metadata || typeof metadata !== 'object') {
      return c.json({
        success: false,
        error: 'Invalid metadata'
      }, 400);
    }

    const updateResult = await updateUserMetadata(
      {
        domain: c.env.AUTH0_DOMAIN,
        clientId: c.env.AUTH0_CLIENT_ID,
        clientSecret: c.env.AUTH0_CLIENT_SECRET,
        audience: c.env.AUTH0_AUDIENCE
      },
      result.user.sub,
      metadata
    );

    if (!updateResult.success) {
      return c.json({
        success: false,
        error: updateResult.error
      }, 500);
    }

    return c.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return c.json({
      success: false,
      error: 'Failed to update profile'
    }, 500);
  }
});

/**
 * GET /api/auth/check-role/:role
 * 사용자 역할 확인
 */
auth.get('/check-role/:role', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const requiredRole = c.req.param('role');
    
    const result = await authenticateRequest(authHeader, {
      domain: c.env.AUTH0_DOMAIN,
      clientId: c.env.AUTH0_CLIENT_ID,
      clientSecret: c.env.AUTH0_CLIENT_SECRET,
      audience: c.env.AUTH0_AUDIENCE
    });

    if (!result.authenticated || !result.user) {
      return c.json({
        success: false,
        error: 'Not authenticated'
      }, 401);
    }

    const accessCheck = checkAccess(result.user, requiredRole);

    return c.json({
      success: true,
      data: {
        hasRole: accessCheck.allowed,
        reason: accessCheck.reason
      }
    });
  } catch (error) {
    console.error('Role check error:', error);
    return c.json({
      success: false,
      error: 'Failed to check role'
    }, 500);
  }
});

/**
 * GET /api/auth/check-permission/:permission
 * 사용자 권한 확인
 */
auth.get('/check-permission/:permission', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const requiredPermission = c.req.param('permission');
    
    const result = await authenticateRequest(authHeader, {
      domain: c.env.AUTH0_DOMAIN,
      clientId: c.env.AUTH0_CLIENT_ID,
      clientSecret: c.env.AUTH0_CLIENT_SECRET,
      audience: c.env.AUTH0_AUDIENCE
    });

    if (!result.authenticated || !result.user) {
      return c.json({
        success: false,
        error: 'Not authenticated'
      }, 401);
    }

    const accessCheck = checkAccess(result.user, undefined, requiredPermission);

    return c.json({
      success: true,
      data: {
        hasPermission: accessCheck.allowed,
        reason: accessCheck.reason
      }
    });
  } catch (error) {
    console.error('Permission check error:', error);
    return c.json({
      success: false,
      error: 'Failed to check permission'
    }, 500);
  }
});

/**
 * GET /api/auth/status
 * 인증 서비스 상태 확인
 */
auth.get('/status', async (c) => {
  const isConfigured = !c.env.AUTH0_DOMAIN.includes('your-tenant');
  
  return c.json({
    success: true,
    data: {
      configured: isConfigured,
      domain: c.env.AUTH0_DOMAIN,
      clientId: c.env.AUTH0_CLIENT_ID,
      audience: c.env.AUTH0_AUDIENCE,
      status: isConfigured ? 'ready' : 'test_mode'
    }
  });
});

/**
 * GET /api/auth/roles
 * 사용 가능한 역할 목록
 */
auth.get('/roles', async (c) => {
  return c.json({
    success: true,
    data: {
      roles: Object.values(FeeZeroRoles)
    }
  });
});

/**
 * GET /api/auth/permissions
 * 사용 가능한 권한 목록
 */
auth.get('/permissions', async (c) => {
  return c.json({
    success: true,
    data: {
      permissions: Object.values(FeeZeroPermissions)
    }
  });
});

export default auth;
