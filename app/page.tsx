'use client';

import React, { useState } from 'react';
import { Sparkles, FileText, Globe, Copy, Download, Bot } from 'lucide-react';
import {
  generateKeywords,
  generateBlogPost,
  translateContent,
  AIModel,
  isAIAvailable,
} from './lib/ai-service';
import toast from 'react-hot-toast';

type ActiveTab = 'keywords' | 'blog' | 'translation' | null;
type BlogStyle = 'informative' | 'human';

interface Results {
  keywords?: string;
  blog?: string;
  translation?: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(null);
  const [results, setResults] = useState<Results>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  // AI 모델 선택 상태
  const [selectedAI, setSelectedAI] = useState<AIModel>('google');

  // 키워드 생성 관련 상태
  const [topic, setTopic] = useState('');

  // 블로그 생성 관련 상태
  const [blogKeyword, setBlogKeyword] = useState('');
  const [blogStyle, setBlogStyle] = useState<BlogStyle>('informative');

  // 번역 관련 상태
  const [translationContent, setTranslationContent] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');

  // 키워드 생성
  const handleGenerateKeywords = async () => {
    if (!topic.trim()) {
      toast.error('관심 분야를 입력해주세요.');
      return;
    }

    setLoading((prev) => ({ ...prev, keywords: true }));
    try {
      const keywords = await generateKeywords(topic, selectedAI);
      setResults((prev) => ({ ...prev, keywords }));
      const aiNames = {
        google: 'Google AI',
        gpt: 'GPT-4',
        claude: 'Claude',
        deepseek: 'DeepSeek',
      };
      toast.success(`✅ ${aiNames[selectedAI]}로 키워드가 생성되었습니다!`);
    } catch (error) {
      toast.error((error as Error).message || '키워드 생성에 실패했습니다.');
      console.error('키워드 생성 오류:', error);
    } finally {
      setLoading((prev) => ({ ...prev, keywords: false }));
    }
  };

  // 블로그 생성
  const handleGenerateBlog = async () => {
    if (!blogKeyword.trim()) {
      toast.error('키워드를 입력해주세요.');
      return;
    }

    setLoading((prev) => ({ ...prev, blog: true }));
    try {
      const blog = await generateBlogPost(blogKeyword, blogStyle, selectedAI);
      setResults((prev) => ({ ...prev, blog }));
      const aiNames = {
        google: 'Google AI',
        gpt: 'GPT-4',
        claude: 'Claude',
        deepseek: 'DeepSeek',
      };
      toast.success(
        `✅ ${aiNames[selectedAI]}로 블로그 포스팅이 생성되었습니다!`
      );
    } catch (error) {
      toast.error((error as Error).message || '블로그 생성에 실패했습니다.');
      console.error('블로그 생성 오류:', error);
    } finally {
      setLoading((prev) => ({ ...prev, blog: false }));
    }
  };

  // 번역
  const handleTranslate = async () => {
    if (!translationContent.trim()) {
      toast.error('번역할 내용을 입력해주세요.');
      return;
    }

    setLoading((prev) => ({ ...prev, translation: true }));
    try {
      const translation = await translateContent(
        translationContent,
        targetLanguage,
        selectedAI
      );
      setResults((prev) => ({ ...prev, translation }));
      const aiNames = {
        google: 'Google AI',
        gpt: 'GPT-4',
        claude: 'Claude',
        deepseek: 'DeepSeek',
      };
      toast.success(`✅ ${aiNames[selectedAI]}로 번역이 완료되었습니다!`);
    } catch (error) {
      toast.error((error as Error).message || '번역에 실패했습니다.');
      console.error('번역 오류:', error);
    } finally {
      setLoading((prev) => ({ ...prev, translation: false }));
    }
  };

  // 복사 기능
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} 내용이 복사되었습니다!`);
  };

  // 다운로드 기능
  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('파일이 다운로드되었습니다!');
  };

  // 키워드 종합 분석 파싱 함수
  const parseKeywordAnalysis = (analysisText: string) => {
    const sections = {
      keywords: '',
      detailAnalysis: [] as Array<{
        keyword: string;
        searchVolume: string;
        competition: string;
        trend: string;
        difficulty: string;
        score: string;
      }>,
      week1Titles: [] as string[],
      week2Titles: [] as string[],
    };

    const lines = analysisText.split('\n').filter((line) => line.trim());
    let currentSection = '';

    for (const line of lines) {
      if (
        line.includes('1. 초기 키워드 분석 결과') ||
        line.includes('초기 키워드 분석 결과')
      ) {
        currentSection = 'keywords';
        continue;
      }
      if (
        line.includes('2. 키워드 상세 분석') ||
        line.includes('키워드 상세 분석')
      ) {
        currentSection = 'detail';
        continue;
      }
      if (
        line.includes('3. 1주차 블로그 제목') ||
        line.includes('1주차 블로그 제목')
      ) {
        currentSection = 'week1';
        continue;
      }
      if (
        line.includes('4. 2주차 블로그 제목') ||
        line.includes('2주차 블로그 제목')
      ) {
        currentSection = 'week2';
        continue;
      }

      // 키워드 파싱
      if (currentSection === 'keywords' && line.includes(',')) {
        sections.keywords = line;
      }

      // 상세 분석 파싱
      if (
        currentSection === 'detail' &&
        line.includes('|') &&
        !line.includes('키워드')
      ) {
        const parts = line.split('|').map((p) => p.trim());
        if (parts.length >= 6) {
          sections.detailAnalysis.push({
            keyword: parts[0],
            searchVolume: parts[1],
            competition: parts[2],
            trend: parts[3],
            difficulty: parts[4],
            score: parts[5],
          });
        }
      }

      // 블로그 제목 파싱
      if (currentSection === 'week1' && /^\d+\./.test(line)) {
        sections.week1Titles.push(line.replace(/^\d+\.\s*/, ''));
      }
      if (currentSection === 'week2' && /^\d+\./.test(line)) {
        sections.week2Titles.push(line.replace(/^\d+\.\s*/, ''));
      }
    }

    return sections;
  };

  // 키워드 종합 분석 렌더링
  const renderKeywordAnalysis = (analysisText: string) => {
    const analysis = parseKeywordAnalysis(analysisText);

    return (
      <div className="space-y-6">
        {/* 1. 초기 키워드 분석 결과 */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            📊 초기 키워드 분석 결과
          </h3>
          {analysis.keywords && (
            <div className="excel-style-grid">
              <div className="grid-header">
                <div className="grid-cell header-cell">A</div>
                <div className="grid-cell header-cell">B</div>
                <div className="grid-cell header-cell">C</div>
                <div className="grid-cell header-cell">D</div>
                <div className="grid-cell header-cell">E</div>
              </div>
              {(() => {
                const keywords = analysis.keywords
                  .split(',')
                  .map((k) => k.trim())
                  .slice(0, 50);
                const rows = [];
                for (let i = 0; i < keywords.length; i += 5) {
                  rows.push(keywords.slice(i, i + 5));
                }
                return rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid-row">
                    {Array.from({ length: 5 }, (_, colIndex) => (
                      <div
                        key={colIndex}
                        className="grid-cell data-cell"
                        title={row[colIndex] || ''}
                      >
                        {row[colIndex] || ''}
                      </div>
                    ))}
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        {/* 2. 키워드 상세 분석 */}
        {analysis.detailAnalysis.length > 0 && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              🔍 키워드 상세 분석
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left">
                      키워드
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center">
                      검색량
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center">
                      경쟁도
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center">
                      트렌드
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center">
                      난이도
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center">
                      종합점수
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.detailAnalysis.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="border border-gray-300 px-4 py-3 font-medium">
                        {item.keyword}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {item.searchVolume}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {item.competition}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {item.trend}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {item.difficulty}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center font-bold text-blue-600">
                        {item.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. 1주차 블로그 제목 */}
        {analysis.week1Titles.length > 0 && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              📝 1주차 블로그 제목
            </h3>
            <ul className="space-y-2">
              {analysis.week1Titles.map((title, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded"
                >
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-bold min-w-[24px] text-center">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. 2주차 블로그 제목 */}
        {analysis.week2Titles.length > 0 && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              📝 2주차 블로그 제목
            </h3>
            <ul className="space-y-2">
              {analysis.week2Titles.map((title, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded"
                >
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-bold min-w-[24px] text-center">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          🚀 Gimso AI 블로그 자동화
        </h1>
        <p className="text-xl text-white/80 mb-8">
          키워드 생성부터 다국어 번역까지, 원하는 기능을 선택하여 사용하세요
        </p>
      </div>

      {/* 기능 선택 버튼들과 AI 선택 드롭다운 */}
      <div className="flex justify-center items-center gap-4 mb-8 flex-wrap">
        <button
          onClick={() => setActiveTab('keywords')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'keywords'
              ? 'bg-white text-gimso-primary shadow-lg'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          키워드 선택
        </button>

        <button
          onClick={() => setActiveTab('blog')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'blog'
              ? 'bg-white text-gimso-primary shadow-lg'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <FileText className="w-5 h-5" />
          블로그 포스팅
        </button>

        <button
          onClick={() => setActiveTab('translation')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'translation'
              ? 'bg-white text-gimso-primary shadow-lg'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <Globe className="w-5 h-5" />
          번역
        </button>

        {/* AI 선택 드롭다운 */}
        <div className="relative">
          <select
            value={selectedAI}
            onChange={(e) => setSelectedAI(e.target.value as AIModel)}
            className="ai-selector appearance-none text-white rounded-lg px-4 py-3 pr-10 font-medium min-w-[140px] focus:outline-none"
          >
            <option value="google" className="text-gray-900">
              ✅ Google AI (무료)
            </option>
            <option
              value="gpt"
              className="text-gray-900"
              disabled={!isAIAvailable('gpt')}
            >
              {isAIAvailable('gpt') ? '✅' : '💰'} OpenAI GPT (유료 - 담당자
              문의)
            </option>
            <option
              value="claude"
              className="text-gray-900"
              disabled={!isAIAvailable('claude')}
            >
              {isAIAvailable('claude') ? '✅' : '💰'} Claude (유료 - 담당자
              문의)
            </option>
            <option
              value="deepseek"
              className="text-gray-900"
              disabled={!isAIAvailable('deepseek')}
            >
              {isAIAvailable('deepseek') ? '✅' : '💰'} DeepSeek (유료 - 담당자
              문의)
            </option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Bot className="w-4 h-4 text-white/70" />
          </div>
          {selectedAI !== 'google' && !isAIAvailable(selectedAI) && (
            <div className="absolute top-full left-0 mt-1 text-xs text-white/80 whitespace-nowrap">
              💰 유료 AI - 사용을 원하시면 담당자에게 문의하세요
            </div>
          )}
        </div>
      </div>

      {/* 입력 폼 영역 */}
      {activeTab && (
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          {/* 키워드 생성 폼 */}
          {activeTab === 'keywords' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-gimso-primary" />
                황금 키워드 생성
              </h2>
              <p className="text-gray-600 mb-6">
                검색량이 높고 경쟁도가 낮은 황금 키워드 50개를 추출합니다.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎯 주제 또는 관심 분야 입력
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerateKeywords();
                      }
                    }}
                    placeholder="예: 콩성형, 피부관리, 재테크, 다이어트 등... (엔터키로 바로 생성)"
                    className="textarea-field"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 팁: 엔터키를 누르면 바로 생성됩니다 (Shift+엔터로 줄바꿈)
                  </p>
                </div>

                <button
                  onClick={handleGenerateKeywords}
                  disabled={loading.keywords}
                  className="btn-primary w-full"
                >
                  {loading.keywords ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="loading-spinner"></div>
                      황금 키워드 생성 중...
                    </div>
                  ) : (
                    '🔍 황금 키워드 50개 생성'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 블로그 포스팅 폼 */}
          {activeTab === 'blog' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-gimso-primary" />
                블로그 포스팅 생성
              </h2>

              <div className="space-y-6">
                {/* 스타일 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    📝 포스팅 스타일 선택
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setBlogStyle('informative')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        blogStyle === 'informative'
                          ? 'border-gimso-primary bg-gimso-primary/10'
                          : 'border-gray-200 hover:border-gimso-primary/50'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">
                        📚 정보성 스타일
                      </h3>
                      <p className="text-sm text-gray-600">
                        체계적이고 전문적인 정보 전달 중심의 블로그 포스팅
                      </p>
                    </button>

                    <button
                      onClick={() => setBlogStyle('human')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        blogStyle === 'human'
                          ? 'border-gimso-primary bg-gimso-primary/10'
                          : 'border-gray-200 hover:border-gimso-primary/50'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">
                        👥 인간형 스타일
                      </h3>
                      <p className="text-sm text-gray-600">
                        친근하고 자연스러운 대화체 중심의 블로그 포스팅
                      </p>
                    </button>
                  </div>
                </div>

                {/* 키워드 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔑 키워드 입력
                  </label>
                  <input
                    type="text"
                    value={blogKeyword}
                    onChange={(e) => setBlogKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleGenerateBlog();
                      }
                    }}
                    placeholder="블로그 주제 키워드를 입력하세요... (엔터키로 바로 생성)"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 팁: 엔터키를 누르면 바로 생성됩니다
                  </p>
                </div>

                <button
                  onClick={handleGenerateBlog}
                  disabled={loading.blog}
                  className="btn-primary w-full"
                >
                  {loading.blog ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="loading-spinner"></div>
                      블로그 포스팅 생성 중...
                    </div>
                  ) : (
                    `📝 ${
                      blogStyle === 'informative' ? '정보성' : '인간형'
                    } 블로그 포스팅 생성`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 번역 폼 */}
          {activeTab === 'translation' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Globe className="w-6 h-6 text-gimso-primary" />
                다국어 번역
              </h2>

              <div className="space-y-6">
                {/* 번역할 언어 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    🌍 번역할 언어 선택
                  </label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setTargetLanguage('en')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        targetLanguage === 'en'
                          ? 'border-gimso-primary bg-gimso-primary/10'
                          : 'border-gray-200 hover:border-gimso-primary/50'
                      }`}
                    >
                      🇺🇸 영어
                    </button>
                    <button
                      onClick={() => setTargetLanguage('zh')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        targetLanguage === 'zh'
                          ? 'border-gimso-primary bg-gimso-primary/10'
                          : 'border-gray-200 hover:border-gimso-primary/50'
                      }`}
                    >
                      🇨🇳 중국어
                    </button>
                    <button
                      onClick={() => setTargetLanguage('ja')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        targetLanguage === 'ja'
                          ? 'border-gimso-primary bg-gimso-primary/10'
                          : 'border-gray-200 hover:border-gimso-primary/50'
                      }`}
                    >
                      🇯🇵 일본어
                    </button>
                  </div>
                </div>

                {/* 번역할 내용 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📄 번역할 내용 입력
                  </label>
                  <textarea
                    value={translationContent}
                    onChange={(e) => setTranslationContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault();
                        handleTranslate();
                      }
                    }}
                    placeholder="번역할 텍스트를 입력하세요... (Ctrl+엔터로 바로 번역)"
                    className="textarea-field"
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 팁: Ctrl+엔터키를 누르면 바로 번역됩니다 (엔터키는
                    줄바꿈)
                  </p>
                </div>

                <button
                  onClick={handleTranslate}
                  disabled={loading.translation}
                  className="btn-primary w-full"
                >
                  {loading.translation ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="loading-spinner"></div>
                      번역 중...
                    </div>
                  ) : (
                    `🌐 ${
                      targetLanguage === 'en'
                        ? '영어'
                        : targetLanguage === 'zh'
                        ? '중국어'
                        : '일본어'
                    }로 번역`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 결과 프리뷰 영역 */}
      {(results.keywords || results.blog || results.translation) && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 키워드 결과 */}
          {results.keywords && (
            <div className="resizable-panel">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gimso-primary" />
                  황금 키워드
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    ↘️ 크기 조절 가능
                  </span>
                  <button
                    onClick={() => copyToClipboard(results.keywords!, '키워드')}
                    className="text-gray-500 hover:text-gimso-primary transition-colors"
                    title="복사"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      downloadAsFile(results.keywords!, 'keywords.md')
                    }
                    className="text-gray-500 hover:text-gimso-primary transition-colors"
                    title="다운로드"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                {renderKeywordAnalysis(results.keywords!)}
              </div>
            </div>
          )}

          {/* 블로그 결과 */}
          {results.blog && (
            <div className="resizable-panel">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gimso-primary" />
                  블로그 포스팅
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    ↘️ 크기 조절 가능
                  </span>
                  <button
                    onClick={() => copyToClipboard(results.blog!, '블로그')}
                    className="text-gray-500 hover:text-gimso-primary transition-colors"
                    title="복사"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      downloadAsFile(results.blog!, 'blog-post.md')
                    }
                    className="text-gray-500 hover:text-gimso-primary transition-colors"
                    title="다운로드"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
                <div className="prose-custom">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: results.blog
                        .replace(/\n/g, '<br/>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 번역 결과 */}
          {results.translation && (
            <div className="resizable-panel">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gimso-primary" />
                  번역 결과
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    ↘️ 크기 조절 가능
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(results.translation!, '번역')
                    }
                    className="text-gray-500 hover:text-gimso-primary transition-colors"
                    title="복사"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      downloadAsFile(results.translation!, 'translation.md')
                    }
                    className="text-gray-500 hover:text-gimso-primary transition-colors"
                    title="다운로드"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
                <div className="prose-custom">
                  <pre className="whitespace-pre-wrap text-sm">
                    {results.translation}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
