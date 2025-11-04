'use client';

import { useState } from 'react';
import LeftPanel from '@/components/execution/LeftPanel/LeftPanel';
import RightPanel from '@/components/execution/RightPanel/RightPanel';
import Logo from '@/components/shared/Logo/Logo';

export default function Execution() {
  const [currentStep, setCurrentStep] = useState(0);
  const [executionResult, setExecutionResult] = useState<any>(null);

  // Получаем текущий ExecutionStep
  const currentExecutionStep = executionResult?.trace?.[currentStep] || null;

  // Добавьте эти логи
  console.log('📦 executionResult:', executionResult);
  console.log('🎯 currentStep:', currentStep);
  console.log('⭐ currentExecutionStep:', currentExecutionStep);

  return (
    <div className='px-[50px] py-[50px] h-screen bg-[#0d0d0d]'>
      <div className='flex gap-5 h-full'>
        <div className='flex-[1]'>
          <div className='h-full rounded-3xl overflow-hidden border border-white/[0.08] bg-[#1a1a1a]/80 backdrop-blur-xl shadow-2xl'>
            <LeftPanel
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              executionResult={executionResult}
              setExecutionResult={setExecutionResult}
            />
          </div>
        </div>
        <div className='flex-[2] rounded-3xl overflow-hidden border border-white/[0.08] bg-[#1a1a1a]/80 backdrop-blur-xl shadow-2xl'>
          <RightPanel executionStep={currentExecutionStep} />
        </div>
      </div>
    </div>
  );
}
