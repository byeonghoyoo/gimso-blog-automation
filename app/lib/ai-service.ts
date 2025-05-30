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
const claudeClient = claudeApiKey
  ? new OpenAI({
      apiKey: claudeApiKey,
      baseURL: 'https://api.anthropic.com',
      dangerouslyAllowBrowser: true,
    })
  : null;

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
      const result = await googleModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } else if (model === 'gpt') {
      const response = await openaiClient!.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      });
      return response.choices[0]?.message?.content || '';
    } else if (model === 'claude') {
      // Claude는 실제로는 다른 SDK가 필요하지만, 구조만 준비
      throw new Error(
        '🚧 Claude API 연동 준비 중입니다.\n\n💰 사용을 원하시면 담당자에게 문의해주세요.'
      );
    } else if (model === 'deepseek') {
      const response = await deepseekClient!.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      });
      return response.choices[0]?.message?.content || '';
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
키워드 50개를 쉼표로 구분하여 나열:
${topic} 효과, ${topic} 후기, ${topic} 가격, ${topic} 병원, ${topic} 부작용, ...

### 2. 키워드 상세 분석
다음 형식의 테이블 (10개 키워드만):
키워드 | 검색량 | 경쟁도 | 트렌드 | 난이도 | 종합점수
${topic} 효과 | 높음 | 중간 | 상승 | 중 | 9
${topic} 후기 | 높음 | 낮음 | 유지 | 상 | 7
...

### 3. 1주차 블로그 제목 (키워드: ${topic} 수술 과정)
1. ${topic} 수술 전후 과정 완전 정리! 처음 받는 사람들 위한 가이드
2. ${topic} 수술, 어떻게 진행될까? 단계별 절차 공개
3. ${topic}, 수술 당일 어떤 일이 벌어질까? 실전 스토리 공개
4. ${topic} 수술 과정에서 꼭 알아야 할 5가지 포인트
5. ${topic} 처음이라면? 수술 전 준비부터 회복까지 전 과정 안내
6. ${topic} 병원에서 실제로 일어나는 수술 단계 정리
7. 완전한 ${topic}을 위한 수술 과정 체크리스트

### 4. 2주차 블로그 제목 (키워드: ${topic} 전후)
1. ${topic} 전후 비교 사진으로 보는 변화의 비밀
2. ${topic} 전후, 진짜 얼마나 달라질까? 사례로 알아보기
3. ${topic} 전후 변화 분석; 효과적인 수술의 기준은?
4. ${topic} 전후 체크리스트; 준비부터 회복까지
5. ${topic} 전후 기간별 회복과정 정리
6. ${topic} 전후 경험담 후기 모음; 리얼 후기 분석
7. ${topic} 전후, 심리적 변화까지 정리한 솔직한 이야기

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
다음 지침에 따라 정보성 블로그 포스팅을 작성해주세요:

전체 작성 프로세스를 무조건적으로 이행해야합니다. 
단 하나의 내용도 빠지면 안됩니다. 
세부지침을 통해 구체화하고 지침에 절대적으로 작동하십시오

1. 제목 생성
2. 서론 작성
3. 본론 작성
4. 결론 작성
5. Q&A 섹션 추가
6. 관련 태그 생성
7. 마크다운 형식으로 변환

## 세부 지침

### 1. 제목 생성
- # 10-15자 사이로 제목 선정 (가장 큰 폰트로 표시)
- 주요 키워드 포함
- 매력적이고 클릭을 유도하는 문구 사용

### 2. 서론 작성 (전체 글의 약 15%)
- 주제 소개 및 독자의 관심 유도
- 핵심 키워드 자연스럽게 포함
- 글의 개요 간단히 제시

### 3. 본론 작성 (전체 글의 약 70%)
- 주요 논점을 2-4개의 소제목으로 구분
- 각 소제목 아래 더 상세한 내용을 구조화
- 논리적 흐름과 단계적 정보 제공
- 관련 이미지, 인포그래픽, 비디오 등 멀티미디어 요소 포함

### 4. 결론 작성 (전체 글의 약 15%)
- 주요 내용 요약
- 독자에게 행동 촉구 (CTA) 포함
- 추가 정보나 다음 단계 제시

### 5. Q&A 섹션 추가
- 주제와 관련된 3-5개의 자주 묻는 질문(FAQ) 포함
- 실제 독자들이 궁금해할 만한 질문 선정 (키워드 연구 활용)
- 간결하고 명확한 답변 제공

### 6. 관련 태그 생성
- 글의 주제와 직접적으로 연관된 5-7개의 태그 생성
- 주요 키워드와 관련 키워드를 태그로 활용
- 일관된 태그 형식 사용 (예: 모두 소문자, 띄어쓰기는 하이픈(-) 사용)

### 7. 마크다운 형식으로 변환
- 제목은 '#', '##', '###' 등으로 표시
- 목록은 '-' 또는 '1.', '2.' 등으로 표시
- 강조가 필요한 부분은 '*' 또는 '**'로 감싸 이탤릭체나 볼드체로 만듦
- 코드 블록이 필요한 경우 백틱 3개로 감싸줌

## 추가 고려사항

### 글자 수 및 형식
- 총 글자 수: 3,500자 이상 4,500자 이하 (공백 포함, 한글 기준)
- 단락: 2-3문장으로 구성 (최대 5문장)

### 인간적인 글쓰기 및 감정 표현
- 개인적인 경험이나 일화 공유
- 비유와 은유를 사용하여 복잡한 개념 설명
- 다양한 문장 구조와 길이 사용
- 대화체나 질문형 문장 사용으로 독자와 소통하는 듯한 느낌 전달
- 감정을 나타내는 형용사와 부사 적절히 사용
- 개인적인 의견이나 견해 표현 (예: "내 경험상...", "개인적으로 생각하기에...")
- 유머나 재치 있는 표현 적절히 사용
- 독자의 감정에 호소하는 문구 사용 (예: "여러분도 이런 경험 있으시죠?")

### 이모지 사용 가이드
- 주요 섹션 제목 앞에 관련 이모지 사용 (예: 📌 주요 포인트, 💡 팁, 🔑 핵심 정보)
- 글의 흐름을 방해하지 않도록 적절히 사용 (과도한 사용 지양)
- 목록이나 중요 포인트를 강조할 때 사용 (예: ✅ 체크리스트, 🚫 주의사항)
- 독자층과 주제에 맞는 이모지 선택 (전문적인 주제라면 이모지 사용 최소화)

키워드: "${keyword}"

위 지침에 따라 "${keyword}"에 대한 정보성 블로그 포스팅을 작성해주세요.
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
