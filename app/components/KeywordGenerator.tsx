'use client';

import { useState } from 'react';
import { Sparkles, Copy, RefreshCw } from 'lucide-react';
import { generateKeywords } from '../lib/ai-service';
import toast from 'react-hot-toast';

interface KeywordGeneratorProps {
  onComplete: (data: { keywords: string }) => void;
  data: any;
}

const KeywordGenerator = ({ onComplete, data }: KeywordGeneratorProps) => {
  const [keywords, setKeywords] = useState(data.keywords || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputTopic, setInputTopic] = useState('');

  const handleGenerate = async () => {
    if (!inputTopic.trim()) {
      toast.error('주제를 입력해주세요!');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedKeywords = await generateKeywords(inputTopic);
      setKeywords(generatedKeywords);
      toast.success('황금 키워드 50개가 생성되었습니다!');
    } catch (error) {
      toast.error('키워드 생성 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(keywords);
    toast.success('키워드가 클립보드에 복사되었습니다!');
  };

  const handleComplete = () => {
    if (!keywords.trim()) {
      toast.error('먼저 키워드를 생성해주세요!');
      return;
    }
    onComplete({ keywords });
  };

  // 키워드를 표 형태로 변환하는 함수
  const renderKeywordTable = (keywordText: string) => {
    const lines = keywordText.split('\n').filter((line) => line.trim());
    const tableLines = lines.filter((line) => line.includes('|'));

    if (tableLines.length === 0) {
      return (
        <div className="text-gray-600 whitespace-pre-wrap">{keywordText}</div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          {tableLines.map((line, index) => {
            const cells = line
              .split('|')
              .map((cell) => cell.trim())
              .filter((cell) => cell);
            return (
              <tr key={index} className={index === 0 ? 'bg-gray-100' : ''}>
                {cells.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border border-gray-300 px-3 py-2 text-sm text-center"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="w-12 h-12 text-gimso-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🏆 황금 키워드 생성
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          검색량이 높고 경쟁도가 낮은 황금 키워드 50개를 자동으로 추출합니다.
          다양한 니치와 주제를 포함하여 블로그 콘텐츠 전략에 바로 활용할 수
          있습니다.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 입력 영역 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 주제 또는 관심 분야 입력
            </label>
            <textarea
              value={inputTopic}
              onChange={(e) => setInputTopic(e.target.value)}
              placeholder="예: 건강, 뷰티, 재테크, 여행, 자기계발 등의 주제나 관심 분야를 입력하세요."
              className="textarea-field"
              rows={3}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="loading-spinner" />
                <span>키워드 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>황금 키워드 50개 생성</span>
              </>
            )}
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 선정 기준</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>검색량:</strong> 월간 검색량이 높은 키워드 우선
              </li>
              <li>
                • <strong>경쟁도:</strong> 낮은 블로그/웹 경쟁 키워드 우선
              </li>
              <li>
                • <strong>수익성:</strong> 전환율 높거나 광고 단가가 높은 키워드
              </li>
              <li>
                • <strong>트렌드성:</strong> 최근 검색 증가 중인 키워드
              </li>
              <li>
                • <strong>주제 다양성:</strong> 카테고리별로 고르게 분포
              </li>
            </ul>
          </div>
        </div>

        {/* 결과 영역 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              🎯 생성된 황금 키워드 (5×10 표)
            </label>
            {keywords && (
              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>복사</span>
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

          <div className="preview-box custom-scrollbar min-h-[400px]">
            {keywords ? (
              renderKeywordTable(keywords)
            ) : (
              <div className="text-center text-gray-500 py-20">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>주제를 입력하고 황금 키워드를 생성해보세요!</p>
              </div>
            )}
          </div>

          {keywords && (
            <button onClick={handleComplete} className="btn-primary w-full">
              ✅ 키워드 선택 완료 - 다음 단계로
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeywordGenerator;
