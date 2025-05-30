'use client';

import { useState } from 'react';
import { Globe, Copy, Download, RefreshCw, Eye } from 'lucide-react';
import { translateContent } from '../lib/ai-service';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

interface TranslationServiceProps {
  onComplete: (data: { translations: any }) => void;
  data: any;
}

const languages = [
  { code: 'en', name: '영어', flag: '🇺🇸', label: 'English' },
  { code: 'zh', name: '중국어', flag: '🇨🇳', label: '中文' },
  { code: 'ja', name: '일본어', flag: '🇯🇵', label: '日本語' },
];

const TranslationService = ({ onComplete, data }: TranslationServiceProps) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [translations, setTranslations] = useState<{ [key: string]: string }>(
    data.translations || {}
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [activePreview, setActivePreview] = useState<string | null>(null);

  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(langCode)
        ? prev.filter((code) => code !== langCode)
        : [...prev, langCode]
    );
  };

  const handleTranslate = async () => {
    if (selectedLanguages.length === 0) {
      toast.error('번역할 언어를 선택해주세요!');
      return;
    }

    if (!data.blogContent) {
      toast.error('먼저 블로그를 작성해주세요!');
      return;
    }

    setIsTranslating(true);
    try {
      const newTranslations: { [key: string]: string } = {};

      for (const langCode of selectedLanguages) {
        const language = languages.find((lang) => lang.code === langCode);
        if (language) {
          toast.loading(`${language.name} 번역 중...`, { id: langCode });
          const translated = await translateContent(data.blogContent, langCode);
          newTranslations[langCode] = translated;
          toast.success(`${language.name} 번역 완료!`, { id: langCode });
        }
      }

      setTranslations(newTranslations);
      toast.success('모든 번역이 완료되었습니다!');
    } catch (error) {
      toast.error('번역 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = (langCode: string) => {
    const content = translations[langCode];
    if (content) {
      navigator.clipboard.writeText(content);
      const language = languages.find((lang) => lang.code === langCode);
      toast.success(`${language?.name} 번역이 클립보드에 복사되었습니다!`);
    }
  };

  const handleDownload = (langCode: string) => {
    const content = translations[langCode];
    const language = languages.find((lang) => lang.code === langCode);
    if (content && language) {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blog_${language.name}_${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${language.name} 파일이 다운로드되었습니다!`);
    }
  };

  const handleComplete = () => {
    if (Object.keys(translations).length === 0) {
      toast.error('먼저 번역을 진행해주세요!');
      return;
    }
    onComplete({ translations });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Globe className="w-12 h-12 text-gimso-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🌍 다국어 번역
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          작성된 블로그를 선택한 언어로 자연스럽게 번역합니다. 각 언어의 문화적
          특성을 고려한 고품질 번역을 제공합니다.
        </p>
      </div>

      <div className="space-y-6">
        {/* 언어 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            🌐 번역할 언어 선택
          </label>
          <div className="grid grid-cols-3 gap-4">
            {languages.map((language) => (
              <div
                key={language.code}
                onClick={() => handleLanguageToggle(language.code)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedLanguages.includes(language.code)
                    ? 'border-gimso-primary bg-gimso-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{language.flag}</div>
                  <h3 className="font-semibold text-gray-900">
                    {language.name}
                  </h3>
                  <p className="text-sm text-gray-600">{language.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 번역 버튼 */}
        <button
          onClick={handleTranslate}
          disabled={
            isTranslating || selectedLanguages.length === 0 || !data.blogContent
          }
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {isTranslating ? (
            <>
              <div className="loading-spinner" />
              <span>번역 진행 중...</span>
            </>
          ) : (
            <>
              <Globe className="w-5 h-5" />
              <span>선택한 언어로 번역 시작</span>
            </>
          )}
        </button>

        {/* 번역 결과 */}
        {Object.keys(translations).length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 text-center">
              📄 번역 결과
            </h3>

            {languages
              .filter((lang) => translations[lang.code])
              .map((language) => (
                <div
                  key={language.code}
                  className="border border-gray-200 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{language.flag}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {language.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {language.label}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          setActivePreview(
                            activePreview === language.code
                              ? null
                              : language.code
                          )
                        }
                        className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>
                          {activePreview === language.code ? '원본' : '프리뷰'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleCopy(language.code)}
                        className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
                      >
                        <Copy className="w-4 h-4" />
                        <span>복사</span>
                      </button>
                      <button
                        onClick={() => handleDownload(language.code)}
                        className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>다운로드</span>
                      </button>
                    </div>
                  </div>

                  <div className="preview-box custom-scrollbar max-h-80">
                    {activePreview === language.code ? (
                      <div className="prose-custom">
                        <ReactMarkdown>
                          {translations[language.code]}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                        {translations[language.code]}
                      </pre>
                    )}
                  </div>
                </div>
              ))}

            <button onClick={handleComplete} className="btn-primary w-full">
              ✅ 번역 완료 - 모든 작업 완료!
            </button>
          </div>
        )}

        {/* 원본 블로그 미리보기 */}
        {data.blogContent && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-lg">🇰🇷</span>
              <h4 className="font-semibold text-gray-900">원본 (한국어)</h4>
            </div>
            <div className="preview-box custom-scrollbar max-h-60">
              <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                {data.blogContent.slice(0, 500)}...
              </pre>
            </div>
          </div>
        )}

        {!data.blogContent && (
          <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <Globe className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <p className="text-yellow-800">
              번역할 블로그 내용이 없습니다. 먼저 2단계에서 블로그를
              작성해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationService;
