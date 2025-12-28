/**
 * 🤖 OpenAI Service
 * 
 * AI 기반 기능
 * - 표준 견적 자동 생성
 * - 프로젝트 분석
 * - AI PM 보조 시스템
 * 
 * @see https://platform.openai.com/docs/api-reference
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenAIResponse {
  success: boolean;
  data?: {
    id: string;
    choices: Array<{
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  error?: string;
}

/**
 * OpenAI API 호출
 */
export async function chat(
  apiKey: string,
  request: OpenAIRequest
): Promise<OpenAIResponse> {
  try {
    // 테스트 모드
    if (apiKey.includes('test_key')) {
      console.log('🤖 [DEV MODE] AI request:', {
        model: request.model,
        messages: request.messages.map(m => ({ role: m.role, preview: m.content.substring(0, 50) }))
      });
      
      return {
        success: true,
        data: {
          id: 'chatcmpl-test-' + Date.now(),
          choices: [{
            message: {
              role: 'assistant',
              content: '[테스트 모드] 실제 API 키를 설정하면 AI 응답이 표시됩니다.'
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150
          }
        }
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Failed to call OpenAI:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 프로젝트 견적 자동 생성
 */
export async function generateProjectEstimate(
  apiKey: string,
  projectDescription: string,
  requirements: string[],
  language: 'ko' | 'en' | 'zh' | 'ja' = 'ko'
): Promise<OpenAIResponse> {
  const systemPrompts = {
    ko: `당신은 IT 프로젝트 견적 전문가입니다. 
프로젝트 설명과 요구사항을 분석하여 다음 정보를 제공해주세요:

1. **기능 분해** (주요 기능을 세부 작업으로 분해)
2. **난이도 점수** (각 기능별 1-10점, 이유 포함)
3. **예상 작업 시간** (각 기능별 시간, 총 시간)
4. **권장 예산 범위** (최소-최대 USD)
5. **위험 요소** (프로젝트 진행 시 주의할 점)
6. **권장 기술 스택**

JSON 형식으로 답변해주세요.`,
    en: `You are an IT project estimation expert.
Analyze the project description and requirements, then provide:

1. **Feature Breakdown** (Decompose main features into subtasks)
2. **Difficulty Score** (1-10 for each feature with reasons)
3. **Estimated Hours** (Per feature and total)
4. **Budget Range** (Min-Max in USD)
5. **Risk Factors** (Project concerns)
6. **Recommended Tech Stack**

Respond in JSON format.`,
    zh: `你是一位IT项目评估专家。
分析项目描述和需求，然后提供：

1. **功能分解**（将主要功能分解为子任务）
2. **难度评分**（每个功能1-10分，包含理由）
3. **预估工时**（每个功能和总工时）
4. **预算范围**（最小-最大USD）
5. **风险因素**（项目注意事项）
6. **推荐技术栈**

以JSON格式回答。`,
    ja: `あなたはITプロジェクトの見積もり専門家です。
プロジェクトの説明と要件を分析し、以下を提供してください：

1. **機能分解**（主要機能をサブタスクに分解）
2. **難易度スコア**（各機能1-10点、理由を含む）
3. **推定工数**（機能ごとと合計）
4. **予算範囲**（最小-最大USD）
5. **リスク要因**（プロジェクトの注意点）
6. **推奨技術スタック**

JSON形式で回答してください。`
  };

  return await chat(apiKey, {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompts[language]
      },
      {
        role: 'user',
        content: `프로젝트 설명: ${projectDescription}\n\n요구사항:\n${requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });
}

/**
 * AI PM 보조 - 일정 지연 분석
 */
export async function analyzeProjectDelay(
  apiKey: string,
  projectTitle: string,
  originalDeadline: string,
  currentProgress: number,
  remainingDays: number,
  language: 'ko' | 'en' | 'zh' | 'ja' = 'ko'
): Promise<OpenAIResponse> {
  const prompts = {
    ko: `프로젝트 일정 지연 분석을 수행해주세요.

프로젝트: ${projectTitle}
원래 마감일: ${originalDeadline}
현재 진행률: ${currentProgress}%
남은 기간: ${remainingDays}일

다음을 JSON 형식으로 제공해주세요:
1. risk_level: "low" | "medium" | "high"
2. completion_probability: 0-100 (%)
3. recommendations: 배열 (개선 방안)
4. estimated_extra_days: 추가 필요 일수
5. summary: 전체 요약`,
    en: `Analyze project delay.

Project: ${projectTitle}
Original Deadline: ${originalDeadline}
Current Progress: ${currentProgress}%
Days Remaining: ${remainingDays}

Provide in JSON:
1. risk_level: "low" | "medium" | "high"
2. completion_probability: 0-100 (%)
3. recommendations: array
4. estimated_extra_days: number
5. summary: string`,
    zh: `分析项目延期。

项目：${projectTitle}
原定截止日期：${originalDeadline}
当前进度：${currentProgress}%
剩余天数：${remainingDays}

以JSON格式提供：
1. risk_level: "low" | "medium" | "high"
2. completion_probability: 0-100 (%)
3. recommendations: 数组
4. estimated_extra_days: 数字
5. summary: 字符串`,
    ja: `プロジェクトの遅延分析。

プロジェクト：${projectTitle}
元の締切：${originalDeadline}
現在の進捗：${currentProgress}%
残り日数：${remainingDays}

JSON形式で提供：
1. risk_level: "low" | "medium" | "high"
2. completion_probability: 0-100 (%)
3. recommendations: 配列
4. estimated_extra_days: 数値
5. summary: 文字列`
  };

  return await chat(apiKey, {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an AI project manager assistant. Analyze delays and provide actionable insights.'
      },
      {
        role: 'user',
        content: prompts[language]
      }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });
}

/**
 * 요구사항 명확화 도우미
 */
export async function clarifyRequirements(
  apiKey: string,
  userRequirement: string,
  language: 'ko' | 'en' | 'zh' | 'ja' = 'ko'
): Promise<OpenAIResponse> {
  const systemPrompts = {
    ko: '사용자의 모호한 요구사항을 명확하게 정리해주세요. 구체적인 질문 3-5개와 권장 기능 명세를 제공해주세요.',
    en: 'Clarify vague requirements. Provide 3-5 specific questions and recommended feature specs.',
    zh: '澄清模糊的需求。提供3-5个具体问题和推荐的功能规格。',
    ja: '曖昧な要件を明確にしてください。3-5つの具体的な質問と推奨機能仕様を提供してください。'
  };

  return await chat(apiKey, {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompts[language]
      },
      {
        role: 'user',
        content: userRequirement
      }
    ],
    temperature: 0.5,
    max_tokens: 1500
  });
}

/**
 * 코드 리뷰 도우미
 */
export async function reviewCode(
  apiKey: string,
  code: string,
  language: 'javascript' | 'typescript' | 'python' | 'java' | 'go',
  reviewLanguage: 'ko' | 'en' | 'zh' | 'ja' = 'ko'
): Promise<OpenAIResponse> {
  const prompts = {
    ko: `다음 ${language} 코드를 리뷰해주세요:

\`\`\`${language}
${code}
\`\`\`

다음을 JSON 형식으로 제공해주세요:
1. quality_score: 1-10
2. issues: 배열 (문제점)
3. suggestions: 배열 (개선 제안)
4. security_concerns: 배열 (보안 이슈)
5. performance_tips: 배열 (성능 개선)`,
    en: `Review this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide in JSON:
1. quality_score: 1-10
2. issues: array
3. suggestions: array
4. security_concerns: array
5. performance_tips: array`,
    zh: `审查这段${language}代码：

\`\`\`${language}
${code}
\`\`\`

以JSON格式提供：
1. quality_score: 1-10
2. issues: 数组
3. suggestions: 数组
4. security_concerns: 数组
5. performance_tips: 数组`,
    ja: `この${language}コードをレビューしてください：

\`\`\`${language}
${code}
\`\`\`

JSON形式で提供：
1. quality_score: 1-10
2. issues: 配列
3. suggestions: 配列
4. security_concerns: 配列
5. performance_tips: 配列`
  };

  return await chat(apiKey, {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a senior code reviewer. Provide constructive feedback on code quality, security, and performance.'
      },
      {
        role: 'user',
        content: prompts[reviewLanguage]
      }
    ],
    temperature: 0.3,
    max_tokens: 2000
  });
}
