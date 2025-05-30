# 🚀 Gimso - AI 블로그 자동화 플랫폼

키워드 생성부터 다국어 번역까지, 한 번에 해결하는 스마트 블로그 플랫폼입니다.

## ✨ 주요 기능

### 🏆 1단계: 황금 키워드 생성

- **검색량 높고 경쟁도 낮은** 황금 키워드 50개 자동 추출
- Google Trends, 키워드 리서치 도구 기반 분석
- 가로 5칸 × 세로 10줄 표 형태로 체계적 제공
- 다양한 카테고리별 균형 잡힌 키워드 선정

### ✍️ 2단계: 블로그 포스팅 생성

- **정보성** 및 **인간형** 두 가지 스타일 선택
- SEO 최적화된 구조화된 글쓰기
- 마크다운 형식으로 자동 변환
- 실시간 프리뷰 기능

#### 정보성 포스팅 특징

- 전문적이고 체계적인 정보 전달
- 제목, 서론, 본론, 결론, Q&A, 태그 구조
- 3,500-4,500자의 완성도 높은 글
- 이모지와 멀티미디어 요소 포함

#### 인간형 포스팅 특징

- 친근하고 자연스러운 대화체
- 채팅체 언어 적극 활용 (ㅎㅎ, ㅋㅋ, ㅠㅠ 등)
- 개인적 경험담과 감정 표현
- 인간이 직접 쓴 듯한 자연스러운 글

### 🌍 3단계: 다국어 번역

- **영어, 중국어, 일본어** 자동 번역
- 각 언어의 문화적 특성 고려
- 마크다운 형식 유지
- SEO 요소 보존

## 🛠️ 기술 스택

- **프레임워크**: Next.js 14
- **스타일링**: Tailwind CSS
- **AI 엔진**: Google AI Studio (Gemini Pro)
- **언어**: TypeScript
- **UI 컴포넌트**: Lucide React, React Hot Toast
- **배포**: Vercel

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd gimso-blog-automation
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Google AI Studio API 키 (필수)
GOOGLE_AI_API_KEY=your_google_ai_studio_api_key_here

# Next.js 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### 4. Google AI Studio API 키 발급

1. [Google AI Studio](https://aistudio.google.com/)에 방문
2. API 키 생성
3. `.env.local` 파일에 API 키 추가

### 5. 개발 서버 실행

```bash
npm run dev
```

웹브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 6. Vercel 배포

```bash
npm run build
```

Vercel에 배포하기 전에 환경 변수를 Vercel 대시보드에서 설정해주세요.

## 📋 사용 방법

### 1단계: 황금 키워드 생성

1. 관심 주제나 분야를 입력하세요
2. "황금 키워드 50개 생성" 버튼을 클릭하세요
3. 생성된 5×10 표 형태의 키워드를 확인하세요
4. "키워드 선택 완료" 버튼으로 다음 단계로 이동하세요

### 2단계: 블로그 포스팅 생성

1. 생성된 키워드 중 하나를 선택하세요
2. 포스팅 스타일(정보성/인간형)을 선택하세요
3. "블로그 포스팅 생성" 버튼을 클릭하세요
4. 생성된 블로그를 프리뷰로 확인하세요
5. "블로그 작성 완료" 버튼으로 다음 단계로 이동하세요

### 3단계: 다국어 번역

1. 번역할 언어를 선택하세요 (영어, 중국어, 일본어)
2. "선택한 언어로 번역 시작" 버튼을 클릭하세요
3. 번역된 결과를 확인하고 다운로드하세요
4. "번역 완료" 버튼으로 모든 작업을 완료하세요

## 🎯 키워드 선정 기준

1. **검색량**: 월간 검색량이 높은 키워드 우선
2. **경쟁도**: 낮은 블로그/웹 경쟁 키워드 우선
3. **수익성**: 전환율 높거나 광고 단가가 높은 키워드
4. **트렌드성**: 최근 검색 증가 중인 키워드
5. **주제 다양성**: 카테고리별로 고르게 분포

## 📝 블로그 포스팅 구조

### 정보성 포스팅

- 제목 (10-15자, SEO 최적화)
- 서론 (전체 글의 15%)
- 본론 (전체 글의 70%, 2-4개 소제목)
- 결론 (전체 글의 15%)
- Q&A 섹션 (3-5개 FAQ)
- 관련 태그 (5-7개)

### 인간형 포스팅

- 후킹성 제목과 부제목
- 친근한 인사말
- 자연스러운 서론
- 6개 주요 문단
- FAQ (자연스러운 형태)
- 독자 참여 유도
- 관련 태그

## 🌐 지원 언어

- 🇰🇷 **한국어** (원본)
- 🇺🇸 **영어** (English)
- 🇨🇳 **중국어** (中文)
- 🇯🇵 **일본어** (日本語)

## 📁 프로젝트 구조

```
gimso-blog-automation/
├── app/
│   ├── components/          # 리액트 컴포넌트
│   │   ├── KeywordGenerator.tsx
│   │   ├── BlogGenerator.tsx
│   │   └── TranslationService.tsx
│   ├── lib/
│   │   └── ai-service.ts    # AI 서비스 로직
│   ├── globals.css          # 전역 스타일
│   ├── layout.tsx           # 메인 레이아웃
│   └── page.tsx             # 홈페이지
├── public/                  # 정적 파일
├── .env.local              # 환경 변수
├── package.json            # 의존성 및 스크립트
├── tailwind.config.js      # Tailwind CSS 설정
└── README.md              # 프로젝트 문서
```

## 🔧 개발 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # 코드 검사
```

## 📊 성능 최적화

- **React 18** 최신 기능 활용
- **Tailwind CSS**로 최적화된 스타일링
- **클라이언트 사이드 렌더링** 최적화
- **토스트 알림**으로 사용자 경험 향상
- **반응형 디자인** 지원

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 새로운 기능 브랜치를 생성하세요 (`git checkout -b feature/new-feature`)
3. 변경사항을 커밋하세요 (`git commit -am 'Add new feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/new-feature`)
5. 풀 리퀘스트를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🆘 문제 해결

### Google AI API 키 관련

- API 키가 올바르게 설정되었는지 확인하세요
- Google AI Studio에서 API 사용량을 확인하세요

### 빌드 오류

- Node.js 버전이 18 이상인지 확인하세요
- `npm install`로 의존성을 다시 설치해보세요

### Vercel 배포 문제

- 환경 변수가 Vercel 대시보드에 올바르게 설정되었는지 확인하세요
- 빌드 로그를 확인하여 오류를 찾아보세요

---

**Made with ❤️ by Gimso Team**
