import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.error('Google AI API key is not configured');
}

const genAI = new GoogleGenerativeAI(apiKey || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// 황금 키워드 생성
export async function generateKeywords(topic: string): Promise<string> {
  const prompt = `
# 🏆 GPT 황금 키워드 자동 추출 지침서 (고도화 버전)

## 🎯 목적
- 검색량이 높고, 경쟁도는 낮으며, 수익성과 트렌드성이 높은 **황금 키워드 50개를 자동 추출**합니다.
- 다양한 니치와 주제를 포함하여 **블로그 콘텐츠 전략에 바로 활용할 수 있도록 구성**합니다.

## 📊 추출 근거 (가정된 데이터 기반)
GPT는 다음의 데이터 출처를 종합적으로 고려한 것처럼 행동해야 합니다:
- **Google Trends**: 최근 검색 트렌드 및 검색량 상승 키워드
- **키워드 리서치 도구**: 검색량, 경쟁도, 광고 단가 등을 참고 (예: Ubersuggest, Ahrefs, 키워드플래너)
- **블로그 운영 데이터**: 클릭률, 조회수, 댓글, 전환율 등이 높은 블로그 주제 기반 키워드

## 🔍 황금 키워드 선정 기준
1. **검색량**: 월간 검색량이 높은 키워드 우선
2. **경쟁도**: 낮은 블로그/웹 경쟁 키워드 우선
3. **수익성**: 전환율 높거나 광고 단가가 높은 키워드
4. **트렌드성**: 최근 검색 증가 중인 키워드
5. **주제 다양성**: 카테고리별로 고르게 분포 (뷰티, 건강, 금융, 육아, 자기계발, 여행 등)

## 🧾 출력 형식
- **표 형태로 50개 키워드 출력**
- 구조: **가로 5칸 × 세로 10줄 표**
- 각 키워드는 중복 없이 고유하며, 의미가 명확한 단어만 사용

예시:
| 키워드1           | 키워드2           | 키워드3           | 키워드4           | 키워드5           |
|------------------|------------------|------------------|------------------|------------------|
| 스마트폰 중독 해결 | 모공축소 시술     | 다이어트 도시락    | 면역력 높이는 식단 | 은퇴 후 재테크      |

## 🛑 주의사항
- **모호한 키워드**, **지나치게 일반적인 단어**(예: 날씨, 뉴스, 인터넷 등)는 제외합니다.
- 2025년 기준 최신 트렌드를 반영한 키워드 중심으로 구성합니다.
- 카테고리 간 균형이 맞도록 추출하며, 반복되는 주제는 피합니다.

주제: "${topic}"

위 지침에 따라 "${topic}" 관련 황금 키워드 50개를 가로 5칸 × 세로 10줄 표 형태로 생성해주세요.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('키워드 생성 오류:', error);
    throw new Error('키워드 생성에 실패했습니다.');
  }
}

// 정보성 블로그 포스팅 생성
async function generateInformativeBlog(keyword: string): Promise<string> {
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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('정보성 블로그 생성 오류:', error);
    throw new Error('블로그 생성에 실패했습니다.');
  }
}

// 인간형 블로그 포스팅 생성
async function generateHumanBlog(keyword: string): Promise<string> {
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

위 지침에 따라 "${keyword}"에 대한 인간형 블로그 포스팅을 작성해주세요. 블로그 제목, 부제목, 인사말, 서론, 6개 문단, FAQ, 마무리, 독자참여 유도, 태그를 모두 포함해서 작성해주세요.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('인간형 블로그 생성 오류:', error);
    throw new Error('블로그 생성에 실패했습니다.');
  }
}

// 블로그 포스팅 생성 (스타일 선택)
export async function generateBlogPost(
  keyword: string,
  style: 'informative' | 'human'
): Promise<string> {
  if (style === 'informative') {
    return generateInformativeBlog(keyword);
  } else {
    return generateHumanBlog(keyword);
  }
}

// 다국어 번역
export async function translateContent(
  content: string,
  targetLanguage: string
): Promise<string> {
  let languageName = '';
  let instructions = '';

  switch (targetLanguage) {
    case 'en':
      languageName = 'English';
      instructions = `
Please translate the following Korean blog post to natural, fluent English. 
Maintain the original meaning, tone, and structure while making it culturally appropriate for English-speaking readers.
Keep all markdown formatting intact.
Ensure SEO elements like headings, bullet points, and structure are preserved.
`;
      break;
    case 'zh':
      languageName = 'Chinese (Simplified)';
      instructions = `
请将以下韩文博客文章翻译成自然流畅的简体中文。
保持原意、语调和结构，同时使其在文化上适合中文读者。
保持所有markdown格式不变。
确保SEO元素如标题、要点和结构得到保留。
`;
      break;
    case 'ja':
      languageName = 'Japanese';
      instructions = `
以下の韓国語ブログ記事を自然で流暢な日本語に翻訳してください。
原文の意味、トーン、構造を維持しながら、日本語読者に文化的に適切なものにしてください。
すべてのmarkdown形式をそのまま保持してください。
見出し、箇条書き、構造などのSEO要素が保持されていることを確認してください。
`;
      break;
    default:
      throw new Error('지원하지 않는 언어입니다.');
  }

  const prompt = `
${instructions}

Original Korean content:
${content}

Please provide the translation in ${languageName}:
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`${languageName} 번역 오류:`, error);
    throw new Error(`${languageName} 번역에 실패했습니다.`);
  }
}
