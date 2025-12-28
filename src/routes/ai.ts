/**
 * 🤖 AI Service API Routes
 * 
 * AI 기반 기능 API 엔드포인트
 */

import { Hono } from 'hono';
import { Bindings } from '../types';
import {
  generateProjectEstimate,
  analyzeProjectDelay,
  clarifyRequirements,
  reviewCode
} from '../services/openai';

const ai = new Hono<{ Bindings: Bindings }>();

/**
 * POST /api/ai/estimate
 * AI 기반 프로젝트 견적 생성
 */
ai.post('/estimate', async (c) => {
  try {
    const { projectDescription, requirements, language = 'ko' } = await c.req.json();

    if (!projectDescription || !Array.isArray(requirements)) {
      return c.json({
        success: false,
        error: 'Missing required fields: projectDescription, requirements (array)'
      }, 400);
    }

    const result = await generateProjectEstimate(
      c.env.OPENAI_API_KEY,
      projectDescription,
      requirements,
      language
    );

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }

    // AI 응답 파싱
    const aiResponse = result.data?.choices[0]?.message?.content;
    let estimate;
    try {
      estimate = JSON.parse(aiResponse || '{}');
    } catch {
      estimate = { raw: aiResponse };
    }

    return c.json({
      success: true,
      data: {
        estimate,
        usage: result.data?.usage
      }
    });
  } catch (error) {
    console.error('AI estimate error:', error);
    return c.json({
      success: false,
      error: 'Failed to generate estimate'
    }, 500);
  }
});

/**
 * POST /api/ai/analyze-delay
 * AI 기반 일정 지연 분석
 */
ai.post('/analyze-delay', async (c) => {
  try {
    const {
      projectTitle,
      originalDeadline,
      currentProgress,
      remainingDays,
      language = 'ko'
    } = await c.req.json();

    if (!projectTitle || !originalDeadline || currentProgress === undefined || !remainingDays) {
      return c.json({
        success: false,
        error: 'Missing required fields'
      }, 400);
    }

    const result = await analyzeProjectDelay(
      c.env.OPENAI_API_KEY,
      projectTitle,
      originalDeadline,
      currentProgress,
      remainingDays,
      language
    );

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }

    // AI 응답 파싱
    const aiResponse = result.data?.choices[0]?.message?.content;
    let analysis;
    try {
      analysis = JSON.parse(aiResponse || '{}');
    } catch {
      analysis = { raw: aiResponse };
    }

    return c.json({
      success: true,
      data: {
        analysis,
        usage: result.data?.usage
      }
    });
  } catch (error) {
    console.error('AI delay analysis error:', error);
    return c.json({
      success: false,
      error: 'Failed to analyze delay'
    }, 500);
  }
});

/**
 * POST /api/ai/clarify-requirements
 * 요구사항 명확화 도우미
 */
ai.post('/clarify-requirements', async (c) => {
  try {
    const { requirement, language = 'ko' } = await c.req.json();

    if (!requirement) {
      return c.json({
        success: false,
        error: 'Missing required field: requirement'
      }, 400);
    }

    const result = await clarifyRequirements(
      c.env.OPENAI_API_KEY,
      requirement,
      language
    );

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }

    const aiResponse = result.data?.choices[0]?.message?.content;

    return c.json({
      success: true,
      data: {
        clarification: aiResponse,
        usage: result.data?.usage
      }
    });
  } catch (error) {
    console.error('AI clarify requirements error:', error);
    return c.json({
      success: false,
      error: 'Failed to clarify requirements'
    }, 500);
  }
});

/**
 * POST /api/ai/review-code
 * 코드 리뷰 도우미
 */
ai.post('/review-code', async (c) => {
  try {
    const { code, language, reviewLanguage = 'ko' } = await c.req.json();

    if (!code || !language) {
      return c.json({
        success: false,
        error: 'Missing required fields: code, language'
      }, 400);
    }

    const validLanguages = ['javascript', 'typescript', 'python', 'java', 'go'];
    if (!validLanguages.includes(language)) {
      return c.json({
        success: false,
        error: `Invalid language. Must be one of: ${validLanguages.join(', ')}`
      }, 400);
    }

    const result = await reviewCode(
      c.env.OPENAI_API_KEY,
      code,
      language,
      reviewLanguage
    );

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }

    // AI 응답 파싱
    const aiResponse = result.data?.choices[0]?.message?.content;
    let review;
    try {
      review = JSON.parse(aiResponse || '{}');
    } catch {
      review = { raw: aiResponse };
    }

    return c.json({
      success: true,
      data: {
        review,
        usage: result.data?.usage
      }
    });
  } catch (error) {
    console.error('AI code review error:', error);
    return c.json({
      success: false,
      error: 'Failed to review code'
    }, 500);
  }
});

/**
 * GET /api/ai/status
 * AI 서비스 상태 확인
 */
ai.get('/status', async (c) => {
  const isConfigured = !c.env.OPENAI_API_KEY.includes('test_key');
  
  return c.json({
    success: true,
    data: {
      configured: isConfigured,
      model: c.env.OPENAI_MODEL,
      maxTokens: parseInt(c.env.OPENAI_MAX_TOKENS),
      status: isConfigured ? 'ready' : 'test_mode'
    }
  });
});

export default ai;
