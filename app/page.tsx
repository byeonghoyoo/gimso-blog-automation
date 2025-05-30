'use client';

import React, { useState } from 'react';
import { Check, ChevronRight, Sparkles, Globe, FileText } from 'lucide-react';
import KeywordGenerator from './components/KeywordGenerator';
import BlogGenerator from './components/BlogGenerator';
import TranslationService from './components/TranslationService';
import toast from 'react-hot-toast';

interface StepData {
  keywords?: string;
  blogContent?: string;
  blogStyle?: 'informative' | 'human';
  translations?: {
    english?: string;
    chinese?: string;
    japanese?: string;
  };
}

const steps = [
  {
    id: 1,
    name: '황금 키워드 생성',
    icon: Sparkles,
    description: '검색량 높고 경쟁도 낮은 키워드 50개 추출',
  },
  {
    id: 2,
    name: '블로그 포스팅',
    icon: FileText,
    description: '선택한 스타일로 고품질 블로그 글 작성',
  },
  {
    id: 3,
    name: '다국어 번역',
    icon: Globe,
    description: '영어, 중국어, 일본어로 자동 번역',
  },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState<StepData>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStepComplete = (step: number, data: any) => {
    setStepData((prev) => ({ ...prev, ...data }));
    setCompletedSteps((prev) => [...prev.filter((s) => s !== step), step]);

    if (step < 3) {
      setCurrentStep(step + 1);
      toast.success(`${step}단계 완료! 다음 단계로 이동합니다.`);
    } else {
      toast.success('모든 단계가 완료되었습니다! 🎉');
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          🚀 Gimso AI 블로그 자동화
        </h1>
        <p className="text-xl text-white/80 mb-8">
          키워드 생성부터 다국어 번역까지, 한 번에 해결하는 스마트 블로그 플랫폼
        </p>

        {/* 스텝 인디케이터 */}
        <div className="flex justify-center items-center space-x-4 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => goToStep(step.id)}
                className={`step-indicator ${
                  completedSteps.includes(step.id)
                    ? 'step-completed'
                    : currentStep === step.id
                    ? 'step-active'
                    : 'step-inactive'
                } hover:scale-110 transition-transform cursor-pointer`}
                disabled={
                  step.id > currentStep && !completedSteps.includes(step.id - 1)
                }
              >
                {completedSteps.includes(step.id) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </button>

              {index < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-white/60 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* 현재 스텝 정보 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-3 text-white">
            {React.createElement(steps[currentStep - 1].icon, {
              className: 'w-6 h-6',
            })}
            <div>
              <h3 className="font-semibold">{steps[currentStep - 1].name}</h3>
              <p className="text-sm text-white/80">
                {steps[currentStep - 1].description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {currentStep === 1 && (
          <KeywordGenerator
            onComplete={(data) =>
              handleStepComplete(1, { keywords: data.keywords })
            }
            data={stepData}
          />
        )}

        {currentStep === 2 && (
          <BlogGenerator
            onComplete={(data) =>
              handleStepComplete(2, {
                blogContent: data.blogContent,
                blogStyle: data.blogStyle,
              })
            }
            data={stepData}
          />
        )}

        {currentStep === 3 && (
          <TranslationService
            onComplete={(data) =>
              handleStepComplete(3, { translations: data.translations })
            }
            data={stepData}
          />
        )}
      </div>

      {/* 진행 상황 요약 */}
      {completedSteps.length > 0 && (
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">📊 진행 상황</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {completedSteps.includes(1) && (
              <div className="bg-white/20 rounded-lg p-3">
                <span className="text-green-300">✅ 키워드 생성 완료</span>
              </div>
            )}
            {completedSteps.includes(2) && (
              <div className="bg-white/20 rounded-lg p-3">
                <span className="text-green-300">✅ 블로그 작성 완료</span>
                <div className="text-white/70 mt-1">
                  스타일:{' '}
                  {stepData.blogStyle === 'informative' ? '정보성' : '인간형'}
                </div>
              </div>
            )}
            {completedSteps.includes(3) && (
              <div className="bg-white/20 rounded-lg p-3">
                <span className="text-green-300">✅ 번역 완료</span>
                <div className="text-white/70 mt-1">
                  {Object.keys(stepData.translations || {}).length}개 언어
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
