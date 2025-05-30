import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';

// AI 모델 타입 정의
export type AIModel = 'google' | 'gpt' | 'claude' | 'deepseek';

// Google AI 설정
const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
if (!googleApiKey) {
  console.error('Google AI API key is not configured');
} else {
  console.log('✅ Google AI 사용 가능');
}
const genAI = new GoogleGenerativeAI(googleApiKey || '');
const googleModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// OpenAI GPT 설정
const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
if (!openaiApiKey) {
  console.log('⏸️ OpenAI GPT API key not configured');
} else {
  console.log('✅ OpenAI GPT 사용 가능');
}
const openaiClient = openaiApiKey
  ? new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true,
    })
  : null;

// Claude API 설정
const claudeApiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY;
if (!claudeApiKey) {
  console.log('⏸️ Claude API key not configured');
} else {
  console.log('✅ Claude 사용 가능');
}
// Claude는 현재 구현되지 않음 (Anthropic SDK 필요)
const claudeClient = null;

// DeepSeek AI 설정
const deepseekApiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
if (!deepseekApiKey) {
  console.log('⏸️ DeepSeek API key not configured');
} else {
  console.log('✅ DeepSeek 사용 가능');
}
const deepseekClient = deepseekApiKey
  ? new OpenAI({
      apiKey: deepseekApiKey,
      baseURL: 'https://api.deepseek.com',
      dangerouslyAllowBrowser: true,
    })
  : null;

// AI 모델별 사용 가능 여부 체크
export function isAIAvailable(model: AIModel): boolean {
  switch (model) {
    case 'google':
      return !!googleApiKey;
    case 'gpt':
      return !!openaiApiKey;
    case 'claude':
      return !!claudeApiKey;
    case 'deepseek':
      return !!deepseekApiKey;
    default:
      return false;
  }
}

// Google AI 생성
async function generateWithGoogle(prompt: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Google AI API 키가 설정되지 않았습니다.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Google AI에서 응답을 받지 못했습니다.');
    }

    return cleanAIResponse(text);
  } catch (error: any) {
    console.error('Google AI 오류:', error);

    if (error.message?.includes('API key')) {
      throw new Error(
        '🔑 Google AI API 키가 올바르지 않습니다. 설정을 확인해주세요.'
      );
    }

    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      throw new Error(
        '📊 Google AI 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.'
      );
    }

    if (error.message?.includes('safety')) {
      throw new Error(
        '🚫 Google AI 안전 정책에 의해 차단된 요청입니다. 다른 키워드로 시도해주세요.'
      );
    }

    throw new Error(
      `Google AI 오류: ${error.message || '알 수 없는 오류가 발생했습니다.'}`
    );
  }
}

// AI 모델에 따른 텍스트 생성 함수
async function generateWithAI(prompt: string, model: AIModel): Promise<string> {
  // API 키 체크
  if (!isAIAvailable(model)) {
    const aiMessages = {
      google:
        '🔑 Google AI API 키가 설정되지 않았습니다.\n\n💡 .env.local 파일에서 API 키를 설정해주세요.',
      gpt: '💰 OpenAI GPT 사용을 위해서는 API 비용 충전이 필요합니다.\n\n📞 담당자에게 문의하시거나 OpenAI 계정에서 결제 정보를 등록해주세요.\n\n🔗 https://platform.openai.com/billing',
      claude:
        '💰 Claude 사용을 위해서는 API 비용 충전이 필요합니다.\n\n📞 담당자에게 문의하시거나 Anthropic 계정에서 결제 정보를 등록해주세요.\n\n🔗 https://console.anthropic.com/billing',
      deepseek:
        '💰 DeepSeek 사용을 위해서는 API 비용 충전이 필요합니다.\n\n📞 담당자에게 문의하시거나 DeepSeek 계정에서 무료 크레딧을 확인해주세요.\n\n🔗 https://platform.deepseek.com/console',
    };
    throw new Error(aiMessages[model]);
  }

  try {
    if (model === 'google') {
      return generateWithGoogle(prompt);
    } else if (model === 'gpt') {
      const response = await openaiClient!.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.7,
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new Error('OpenAI에서 응답을 받지 못했습니다.');
      }
      return cleanAIResponse(text);
    } else if (model === 'claude') {
      // Claude는 현재 사용할 수 없습니다 (구현 필요)
      throw new Error(
        'Claude는 현재 사용할 수 없습니다. 담당자에게 문의해주세요.'
      );
    } else if (model === 'deepseek') {
      const response = await deepseekClient!.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.7,
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new Error('DeepSeek에서 응답을 받지 못했습니다.');
      }
      return cleanAIResponse(text);
    }

    throw new Error('지원하지 않는 AI 모델입니다.');
  } catch (error: any) {
    console.error(`${model} AI 생성 오류:`, error);

    // API 잔액/결제 관련 오류 처리
    if (
      error?.status === 402 ||
      error?.message?.includes('Insufficient Balance')
    ) {
      const balanceMessages = {
        google:
          '💳 Google AI 크레딧이 부족합니다.\n\n📞 담당자에게 문의해주세요.',
        gpt: '💳 OpenAI 계정 잔액이 부족합니다.\n\n📞 담당자에게 문의하시거나 결제 정보를 확인해주세요.',
        claude:
          '💳 Claude 계정 잔액이 부족합니다.\n\n📞 담당자에게 문의하시거나 결제 정보를 확인해주세요.',
        deepseek:
          '💳 DeepSeek 계정 잔액이 부족합니다.\n\n📞 담당자에게 문의하시거나 무료 크레딧을 확인해주세요.',
      };
      throw new Error(balanceMessages[model]);
    }

    // API 키 관련 오류 처리
    if (
      error?.status === 401 ||
      error?.status === 403 ||
      error?.message?.includes('API key')
    ) {
      throw new Error(
        `🔑 ${model.toUpperCase()} API 키 오류가 발생했습니다.\n\n📞 담당자에게 문의해주세요.`
      );
    }

    // 일반적인 오류 처리
    throw new Error(
      `❌ ${model.toUpperCase()} AI 생성에 실패했습니다.\n\n📞 문제가 지속되면 담당자에게 문의해주세요.\n\n오류: ${
        error?.message || '알 수 없는 오류'
      }`
    );
  }
}

// AI 응답 후처리 함수
function cleanAIResponse(response: string): string {
  // 불필요한 메타 정보 제거
  return response
    .replace(/\(약 \d+자\)/g, '') // (약 450자) 형태 제거
    .replace(/\(\d+자\)/g, '') // (450자) 형태 제거
    .replace(/\[글자수: \d+\]/g, '') // [글자수: 450] 형태 제거
    .replace(/글자수: \d+/g, '') // 글자수: 450 형태 제거
    .replace(/\n\s*\n\s*\n/g, '\n\n') // 과도한 줄바꿈 정리
    .trim();
}

// 황금 키워드 생성 (AI 모델 선택 가능)
export async function generateKeywords(
  topic: string,
  model: AIModel = 'google'
): Promise<string> {
  const prompt = `
# 🏆 GPT 황금 키워드 종합 분석 시스템

## 🎯 목적
"${topic}" 주제에 대한 완전한 키워드 마케팅 전략을 수립합니다.

## 📊 출력 형식 (정확히 이 순서로)

### 1. 초기 키워드 분석 결과
"${topic}" 주제와 관련된 다양한 키워드 50개를 쉼표로 구분하여 나열:
${topic} 방법, ${topic} 팁, ${topic} 가이드, ${topic} 추천, ${topic} 후기, ${topic} 비교, ${topic} 순위, ${topic} 무료, ${topic} 유료, ${topic} 초보자, ${topic} 고급, ${topic} 전문가, ${topic} 학습, ${topic} 강의, ${topic} 도구, ${topic} 프로그램, ${topic} 앱, ${topic} 사이트, ${topic} 플랫폼, ${topic} 서비스, ${topic} 업체, ${topic} 회사, ${topic} 전망, ${topic} 트렌드, ${topic} 시장, ${topic} 분석, ${topic} 예측, ${topic} 현황, ${topic} 동향, ${topic} 사례, ${topic} 성공, ${topic} 실패, ${topic} 경험, ${topic} 노하우, ${topic} 비결, ${topic} 요령, ${topic} 기술, ${topic} 기법, ${topic} 전략, ${topic} 계획, ${topic} 준비, ${topic} 시작, ${topic} 입문, ${topic} 기초, ${topic} 활용, ${topic} 응용, ${topic} 실전, ${topic} 실습, ${topic} 연습, ${topic} 문제

### 2. 키워드 상세 분석
다음 형식의 테이블 (10개 키워드만):
키워드 | 검색량 | 경쟁도 | 트렌드 | 난이도 | 종합점수
${topic} 방법 | 높음 | 중간 | 상승 | 중 | 9
${topic} 팁 | 높음 | 낮음 | 유지 | 하 | 8
${topic} 가이드 | 중간 | 중간 | 상승 | 중 | 7
${topic} 추천 | 높음 | 높음 | 상승 | 상 | 6
${topic} 후기 | 중간 | 낮음 | 유지 | 하 | 8
${topic} 비교 | 중간 | 중간 | 상승 | 중 | 7
${topic} 순위 | 낮음 | 높음 | 하락 | 상 | 5
${topic} 학습 | 중간 | 낮음 | 상승 | 하 | 8
${topic} 도구 | 낮음 | 중간 | 유지 | 중 | 6
${topic} 트렌드 | 낮음 | 낮음 | 상승 | 하 | 7

### 3. 1주차 블로그 제목 (키워드: ${topic} 방법)
1. ${topic} 초보자를 위한 완벽 가이드! 기초부터 고급까지
2. ${topic} 시작하는 방법, 단계별로 쉽게 따라하기
3. ${topic} 제대로 하는 법, 전문가가 알려주는 비결
4. ${topic}에서 성공하는 5가지 핵심 포인트
5. ${topic} 처음이라면? 준비부터 실전까지 완전 정리
6. ${topic} 효과적으로 하는 실전 노하우 공개
7. 완벽한 ${topic}을 위한 체크리스트와 팁 모음

### 4. 2주차 블로그 제목 (키워드: ${topic} 추천)
1. ${topic} 추천 순위 TOP 10, 실사용자 후기 기반
2. ${topic} 어떤 걸 선택해야 할까? 비교 분석 완료
3. ${topic} 추천 리스트; 전문가가 엄선한 베스트
4. ${topic} 초보자 추천 vs 고급자 추천, 차이점은?
5. ${topic} 무료 vs 유료 추천, 나에게 맞는 선택은?
6. ${topic} 추천 받기 전 꼭 알아야 할 기준들
7. ${topic} 인기 추천 리스트와 실제 사용 후기 분석

주제: "${topic}"

위 형식을 정확히 따라 "${topic}" 관련 종합 분석을 생성해주세요.
`;

  return generateWithAI(prompt, model);
}

// 정보성 블로그 포스팅 생성
export async function generateInformativeBlog(
  keyword: string,
  model: AIModel = 'google'
): Promise<string> {
  const prompt = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 GPT 설정: SEO 최적화 블로그 생성

[기본 역할]
- 사용자가 입력한 블로그 주제에 맞춰 SEO 구조(사이트 구조, 콘텐츠 구조화, 백링크)를 자동 반영한 블로그 글을 생성

[출력 구조]
1. SEO 최적화 제목(H1)
2. 요약문 (Meta Description, 90자 내외)
3. Hook 문단 (공감 또는 질문 유도)
4. 목차 ("이 글에서 다루는 내용")
5. 본문 (3단 구성: 구조 이해 → 실전 팁 → 실패 방지)
6. 실제 Q&A (2~3개)
7. 콜투액션 (상담 또는 링크 유도)
8. 해시태그 (한 줄 출력, #포함 5~7개)
9. 추천 키워드 (쉼표 구분, 한 줄 출력)

[가이드북 출력 규칙]
- 파일명: [카테고리]-가이드북.txt
- 사용자가 설정한 언어로 작성
- 구성:
  [핵심 요약] – 주제 핵심 요점 3~4문장
  [체크리스트] – 준비 사항 확인용 항목 4~6개
  [추천 행동] – 실천 팁 2~3개

[출력 구성 스타일 제어]
- "1. 제목", "2. 요약문", "📢 콜투액션", "🔍 추천 키워드" 같은 제목 구분자나 이모지 사용 금지
- 글은 제목부터 결론까지 자연스럽게 이어지며, 복사 후 블로그에 바로 붙여넣기 가능해야 함
- 해시태그는 본문 맨 아래 줄에 출력 (# 포함, 한 줄)
- 추천 키워드는 해시태그 바로 아래 줄에 쉼표로 구분해 출력 (제목 없이)

[출력 예시 포맷]
자려한코 성형, 자연스러운 아름다움을 되찾는 방법  
자려한코 성형은 부자연스러운 코 라인을 개선해 자연스러운 얼굴 균형을 되찾는 솔루션입니다.

(본문 생략)

이제는 인위적인 코보다 자연스럽고 조화로운 코가 대세입니다.  
자려한코 성형으로 당신의 얼굴에 진짜 어울리는 아름다움을 찾아보세요.

#자려한코 #코재수술 #자연스러운코 #코성형추천 #얼굴조화 #자가조직성형  
자려한코, 코성형, 코재수술, 자연스러운코, 성형외과추천, 실리콘제거, 자가조직이식, 귀연골성형, 비중격지지

[출력 스타일 최적화 – 사람처럼 보이게]
- 반복되는 표현(예: "깊은 맛", "자연스러운 결과")은 유사 표현으로 다양화
- 3줄 이내의 문장과 1줄짜리 단문을 교차 사용해 리듬감 있는 글 구성
- 실제로 있었던 경험담, 질문, 실사용 후기 등을 섞어 인간적인 톤 유지
  예: "이 질문 정말 많이 받아요!" / "처음 해봤을 땐 저도 실패했어요."
- SEO 키워드는 흐름 속에 자연스럽게 녹여 삽입하고, 나열하지 않는다
- 전형적인 구조는 피하고, 구성 순서를 유연하게 재배치해도 좋음
- 전체 어조는 '친절한 블로거가 말하는 듯한 자연스러운 글'로 구성

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

키워드: "${keyword}"

위 지침에 따라 "${keyword}"에 대한 SEO 최적화 정보성 블로그 포스팅을 작성해주세요.
`;

  return generateWithAI(prompt, model);
}

// 인간형 블로그 포스팅 생성
export async function generateHumanBlog(
  keyword: string,
  model: AIModel = 'google'
): Promise<string> {
  const prompt = `
다음 지침에 따라 인간형 블로그 포스팅을 작성해주세요:

해당 GPT는 사람이 쓴것처럼 블로그 글을 생성하는 블로그휴먼 GPT입니다. SEO 모든 요소를 포함하여, 아래 지침을 절대적으로 참고하여 글을 작성합니다.
특히 인터넷 채팅적 요소를 적극적 사용하여야합니다.

키워드,주제,제목 "${keyword}"을 주제로 즉각 지침에 따라 글을 작성합니다.
한글로 응답합니다. 마크다운 형식으로 제공합니다.

## 주요 지침
- 지식란에 업로드된 글감 어조 참조파일을 참고하여 최대한 인간이 쓴듯한 자연스러운 형태로 작성합니다.
- 글을 작성할때 중요한 두가지는 "정교하지 않은 난해함"과 "문장의 분량"입니다. 그 중 인간이 작성할 경우, "문장의 길이가 짧은 문장", "문장의 길이가 긴 문장"을 섞어 사용하여 정교하지 않으며 정리되지않은 글의 형태처럼 보일 수 있게 글을 작성합니다.
- 단어적 선택은 독특한 단어,일반적으로 일상에서 많이 쓰이는 단어, 전문 작가나 글을 잘쓰는 사람의 요소를 최대한 배제합니다.
- 이해하기 쉬운 언어와 고유단어를 사용하고, 챗GPT,클로드,제미나이 등 LLM 모델들이 사용하지 않는, 즉 AI가 사용하지 않는 단어를 선택하여 사용합니다.
- 한국에서 쓰이는 채팅형식 "ㅎㅎ,ㅋㅋ,ㅠㅠ" 등 자음이나 모음만을 적극 사용합니다.
- 문장의 끝은 ~했구요,했는데요!,하였습니다!,같더라구요! 등, 1인칭 시점의 사람이 직접 작성한듯한 문구를 섞어 씁니다.
- 개인이 직접 경험하고 체험한듯한 느낌으로 글을 작성합니다.
- 표준어를 무시하고 한국 채팅적 요소를 적극 사용합니다(줄임말,표준어 무시 등, 예시: 하겠심다!,함니다~,이겠쥬?,뭘까용?)
- 재치있는 관용적 표현을 상황에 따라 사용합니다.
- 독자들의 공감을 이끌어 낼 수 있는 질문 형식의 친근한 말투로 진행합니다.
- 어조는 친근하고 부드러우며 장난스러운 아이같은 말투로 진행합니다.
- 글의 전체 글자수는 3500자 내외로 작성합니다.
- 상황에 맞게 이모지도 사용합니다(너무 과하게 사용하지 않습니다)
- 제목과 부제목은 강력한 후킹성 제목으로 독자들의 흥미를 이끌 수 있게 합니다. 
- h1,h2,h3 같은 요소도 상황에 따라 적용합니다.
- 문장 구조를 다양화: AI가 생성한 글은 일반적으로 문장이 일정한 구조를 따르는 경향이 있습니다. 문장의 길이를 불규칙하게 하고, 보다 인간적인 문체로 수정합니다.
- 자연스러운 구어체 활용: 인간이 실제로 글을 쓸 때 사용하는 다양한 표현을 추가합니다.
- 의견과 감정을 적극 반영: 개인적인 경험이나 감정을 첨가하면 AI가 아닌 인간이 작성한 듯한 느낌을 줍니다.
- 불필요한 서술 줄이기: AI는 불필요한 반복적인 설명을 많이 포함하는 경향이 있어 이를 줄이는 것이 중요합니다.
- 혼잣말이나 감탄사 추가: '음...', '그러니까 말이야', '진짜 솔직히' 같은 표현을 활용하면 더 자연스럽습니다.
- 반말은 하지 않습니다.

## 톤 & 문체
친근하고 캐주얼하게: 독자와 대화하듯 자연스럽고 편한 말투로 작성합니다.
비격식체 및 자유로운 표현: "하겠심다!", "되시겟슴미다", "먹어봐야쥬" 등 공식적인 표준어보다는 자신만의 느낌이 살아있는 표현을 사용합니다.
인터넷/채팅 언어 적극 사용: "ㅎㅎ", "ㅋㅋ", "ㅠㅠ" 같은 이모티콘 및 감정 표현을 적절히 삽입해 친근함을 더합니다.
표준어 무시: 문법이나 맞춤법에 엄격하지 않고, 실제 대화체처럼 자연스럽게 흘러가는 문장을 사용합니다.

키워드: "${keyword}"

위 지침에 따라 "${keyword}"에 대한 인간형 블로그 포스팅을 작성해주세요.
`;

  return generateWithAI(prompt, model);
}

// 블로그 포스팅 생성 (스타일과 AI 모델 선택)
export async function generateBlogPost(
  keyword: string,
  style: 'informative' | 'human',
  model: AIModel = 'google'
): Promise<string> {
  if (style === 'informative') {
    return generateInformativeBlog(keyword, model);
  } else {
    return generateHumanBlog(keyword, model);
  }
}

// 번역 (AI 모델 선택 가능)
export async function translateContent(
  content: string,
  targetLanguage: string,
  model: AIModel = 'google'
): Promise<string> {
  const languageMap: { [key: string]: string } = {
    en: '영어',
    zh: '중국어',
    ja: '일본어',
  };

  const prompt = `
다음 내용을 ${languageMap[targetLanguage]}로 자연스럽게 번역해주세요.

번역 시 주의사항:
1. 직역이 아닌 의역으로 자연스럽게 번역
2. 원문의 뉘앙스와 감정을 그대로 살려서 번역
3. 해당 언어권에서 자연스럽게 읽히는 문체로 작성
4. 전문 용어나 고유명사는 적절히 현지화
5. 문화적 맥락을 고려한 번역

번역할 내용:
${content}
`;

  return generateWithAI(prompt, model);
}
