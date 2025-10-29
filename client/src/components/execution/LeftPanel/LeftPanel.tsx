'use client';

import { executeCode } from '@/services/api/api';
import CodeEditor from './CodeEditor';
import { useState } from 'react';
interface LeftPanelProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  executionResult: any;
  setExecutionResult: (result: any) => void;
}
export default function LeftPanel({
  currentStep,
  setCurrentStep,
  executionResult,
  setExecutionResult,
}: LeftPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('// Your code here');

  const totalSteps = executionResult?.totalSteps || 0;

  const handleVisualize = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const codeWithExtraLine = code + '\nundefined;';
      console.log('📤 Sending code to backend:');
      console.log(codeWithExtraLine);
      console.log('Lines:', codeWithExtraLine.split('\n'));

      const result = await executeCode(codeWithExtraLine);
      setExecutionResult(result);
      // Если totalSteps = 1, начинаем с 0, иначе с 1 (пропускаем пустой step 0)
      setCurrentStep(result.totalSteps === 1 ? 0 : 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute code');
    } finally {
      setIsLoading(false);
    }
  };
  const minStep = totalSteps === 1 ? 0 : 1;
  const handlePrev = () => setCurrentStep(Math.max(minStep, currentStep - 1));
  const handleNext = () =>
    setCurrentStep(Math.min(totalSteps - 1, currentStep + 1));

  return (
    <div className='flex flex-col h-full p-2.5'>
      <div className='h-[400px] rounded-3xl overflow-hidden border border-zinc-300 dark:border-zinc-800'>
        <CodeEditor value={code} onChange={setCode} />
      </div>
      <div className='flex-1'></div>

      {error && (
        <div className='mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500 text-red-500 text-sm'>
          {error}
        </div>
      )}

      <div className='flex flex-col gap-2 mb-2'>
        <div className='flex items-center gap-2'>
          <span className='text-green-500 text-3xl leading-none -translate-y-1'>
            →
          </span>
          <span className='text-zinc-400 text-base'>Current line</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-red-500 text-3xl leading-none -translate-y-1'>
            →
          </span>
          <span className='text-zinc-400 text-base'>Next line</span>
        </div>
      </div>

      <div className='flex items-center gap-3 mb-2.5'>
        <span className='text-zinc-400 text-sm'>Step</span>
        <input
          type='range'
          min={minStep}
          max={Math.max(minStep, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => setCurrentStep(parseInt(e.target.value))}
          disabled={!executionResult}
          className='flex-1 h-[12px] bg-zinc-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50
  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-600 [&::-webkit-slider-thumb]:cursor-pointer'
        />
        <span className='text-zinc-400 text-sm font-mono'>
          {totalSteps > 0 ? `${currentStep + 1}/${totalSteps}` : '0/0'}
        </span>
      </div>

      <div className='rounded-2xl bg-zinc-600 border border-zinc-600 flex items-center justify-between px-3 py-2'>
        <button
          onClick={handlePrev}
          disabled={!executionResult || currentStep === minStep}
          className='px-4 py-1.5 rounded-lg bg-zinc-600 border border-zinc-500 hover:bg-zinc-500 disabled:opacity-50
  transition-colors text-zinc-200 text-sm'
        >
          Prev
        </button>
        <button
          onClick={handleVisualize}
          disabled={isLoading}
          className='px-4 py-1.5 rounded-lg bg-zinc-600 border border-zinc-500 hover:bg-zinc-500 disabled:opacity-50
  transition-colors text-zinc-200 text-sm'
        >
          {isLoading ? 'Loading...' : 'Visualize'}
        </button>
        <button
          onClick={handleNext}
          disabled={!executionResult || currentStep >= totalSteps - 1}
          className='px-4 py-1.5 rounded-lg bg-zinc-600 border border-zinc-500 hover:bg-zinc-500 disabled:opacity-50
  transition-colors text-zinc-200 text-sm'
        >
          Next
        </button>
      </div>
    </div>
  );
}
