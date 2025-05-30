'use client';

import { useState } from 'react';
import { FileText, Copy, Download, RefreshCw, Eye } from 'lucide-react';
import { generateBlogPost } from '../lib/ai-service';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

interface BlogGeneratorProps {
  onComplete: (data: {
    blogContent: string;
    blogStyle: 'informative' | 'human';
  }) => void;
  data: any;
}

const BlogGenerator = ({ onComplete, data }: BlogGeneratorProps) => {
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [blogStyle, setBlogStyle] = useState<'informative' | 'human'>(
    'informative'
  );
  const [blogContent, setBlogContent] = useState(data.blogContent || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // 키워드에서 개별 키워드 추출
  const extractKeywords = (keywordText: string) => {
    if (!keywordText) return [];

    const lines = keywordText.split('\n');
    const keywords: string[] = [];

    lines.forEach((line) => {
      if (line.includes('|')) {
        const cells = line
          .split('|')
          .map((cell) => cell.trim())
          .filter(
            (cell) =>
              cell &&
              cell !== '키워드1' &&
              cell !== '키워드2' &&
              cell !== '키워드3' &&
              cell !== '키워드4' &&
              cell !== '키워드5'
          );
        keywords.push(...cells);
      }
    });

    return keywords.filter(
      (keyword) => keyword.length > 2 && !keyword.includes('-')
    );
  };

  const handleGenerate = async () => {
    if (!selectedKeyword.trim()) {
      toast.error('키워드를 선택해주세요!');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedContent = await generateBlogPost(
        selectedKeyword,
        blogStyle
      );
      setBlogContent(generatedContent);
      toast.success('블로그 포스팅이 생성되었습니다!');
    } catch (error) {
      toast.error('블로그 생성 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(blogContent);
    toast.success('블로그 내용이 클립보드에 복사되었습니다!');
  };

  const handleDownload = () => {
    const blob = new Blob([blogContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedKeyword}_블로그포스팅.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('마크다운 파일이 다운로드되었습니다!');
  };

  const handleComplete = () => {
    if (!blogContent.trim()) {
      toast.error('먼저 블로그를 생성해주세요!');
      return;
    }
    onComplete({ blogContent, blogStyle });
  };

  const availableKeywords = extractKeywords(data.keywords || '');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="w-12 h-12 text-gimso-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ✍️ 블로그 포스팅 생성
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          선택한 키워드와 스타일로 SEO 최적화된 고품질 블로그 글을 자동으로
          생성합니다.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 설정 영역 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 키워드 선택
            </label>
            {availableKeywords.length > 0 ? (
              <select
                value={selectedKeyword}
                onChange={(e) => setSelectedKeyword(e.target.value)}
                className="input-field"
              >
                <option value="">키워드를 선택하세요</option>
                {availableKeywords.slice(0, 20).map((keyword, index) => (
                  <option key={index} value={keyword}>
                    {keyword}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  먼저 1단계에서 키워드를 생성해주세요.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              📝 포스팅 스타일 선택
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setBlogStyle('informative')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  blogStyle === 'informative'
                    ? 'border-gimso-primary bg-gimso-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold text-gray-900">정보성</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    전문적이고 체계적인 정보 전달
                  </p>
                </div>
              </div>

              <div
                onClick={() => setBlogStyle('human')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  blogStyle === 'human'
                    ? 'border-gimso-primary bg-gimso-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💬</div>
                  <h3 className="font-semibold text-gray-900">인간형</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    친근하고 자연스러운 대화체
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedKeyword}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="loading-spinner" />
                <span>블로그 생성 중...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>블로그 포스팅 생성</span>
              </>
            )}
          </button>

          {/* 스타일 특징 설명 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              {blogStyle === 'informative'
                ? '📊 정보성 포스팅 특징'
                : '💬 인간형 포스팅 특징'}
            </h3>
            {blogStyle === 'informative' ? (
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• SEO 최적화된 구조적 글쓰기</li>
                <li>• 체계적인 목차와 소제목</li>
                <li>• Q&A 섹션 및 관련 태그 포함</li>
                <li>• 전문적이고 신뢰성 있는 정보 전달</li>
                <li>• 3,500-4,500자의 완성도 높은 글</li>
              </ul>
            ) : (
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 친근하고 자연스러운 말투 (ㅎㅎ, ㅋㅋ 등 사용)</li>
                <li>• 개인적인 경험담과 감정 표현</li>
                <li>• 독자와의 소통을 유도하는 문체</li>
                <li>• 채팅체와 줄임말 적극 활용</li>
                <li>• 인간이 직접 쓴 듯한 자연스러운 글</li>
              </ul>
            )}
          </div>
        </div>

        {/* 결과 영역 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                📄 생성된 블로그 포스팅
              </label>
              {blogContent && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>{showPreview ? '원본' : '프리뷰'}</span>
                </button>
              )}
            </div>
            {blogContent && (
              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>복사</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>다운로드</span>
                </button>
                <button
                  onClick={handleGenerate}
                  className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>재생성</span>
                </button>
              </div>
            )}
          </div>

          <div className="preview-box custom-scrollbar min-h-[500px]">
            {blogContent ? (
              showPreview ? (
                <div className="prose-custom">
                  <ReactMarkdown>{blogContent}</ReactMarkdown>
                </div>
              ) : (
                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                  {blogContent}
                </pre>
              )
            ) : (
              <div className="text-center text-gray-500 py-20">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>키워드를 선택하고 블로그를 생성해보세요!</p>
              </div>
            )}
          </div>

          {blogContent && (
            <button onClick={handleComplete} className="btn-primary w-full">
              ✅ 블로그 작성 완료 - 다음 단계로
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogGenerator;
