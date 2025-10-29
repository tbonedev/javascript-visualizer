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
    <div className='px-[50px] py-[50px] h-screen'>
      <div className='flex gap-5 h-full'>
        <div className='flex-[1] flex flex-col gap-5'>
          <div className='rounded-3xl overflow-hidden border border-zinc-300 dark:border-zinc-800'>
            <Logo />
          </div>
          <div className='flex-1 rounded-3xl overflow-hidden border border-zinc-300 dark:border-zinc-800'>
            <LeftPanel
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              executionResult={executionResult}
              setExecutionResult={setExecutionResult}
            />
          </div>
        </div>
        <div className='flex-[2] rounded-3xl overflow-hidden border border-zinc-300 dark:border-zinc-800'>
          <RightPanel executionStep={currentExecutionStep} />
        </div>
      </div>
    </div>
  );
}
