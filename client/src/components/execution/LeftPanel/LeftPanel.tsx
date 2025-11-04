'use client';

import { executeCode } from '@/services/api/api';
import CodeEditor from './CodeEditor';
import { useState } from 'react';
import Console from '../RightPanel/Console/Console';
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
      <div className='h-[350px] rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0f0f0f] shadow-lg'>
        <CodeEditor value={code} onChange={setCode} />
      </div>

      <div className='flex-1'></div>

      {error && (
        <div className='mb-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm backdrop-blur-sm'>
          {error}
        </div>
      )}

      <div className='flex items-start gap-3 mb-2'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <span className='text-emerald-400 text-3xl leading-none -translate-y-1'>
              →
            </span>
            <span className='text-zinc-400 text-base'>Current line</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-rose-400 text-3xl leading-none -translate-y-1'>
              →
            </span>
            <span className='text-zinc-400 text-base'>Next line</span>
          </div>
        </div>
        <div className='ml-auto w-[300px] h-[200px] pr-[2px]'>
          <Console />
        </div>
      </div>

      <div className='flex items-center gap-3 mb-2.5'>
        <span className='text-zinc-400 text-sm font-medium'>Step</span>
        <input
          type='range'
          min={minStep}
          max={Math.max(minStep, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => setCurrentStep(parseInt(e.target.value))}
          disabled={!executionResult}
          className='flex-1 h-[8px] bg-white/5 rounded-full appearance-none cursor-pointer disabled:opacity-50 border border-white/[0.08]
  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110'
        />
        <span className='text-zinc-400 text-sm font-mono tabular-nums'>
          {totalSteps > 0 ? `${currentStep + 1}/${totalSteps}` : '0/0'}
        </span>
      </div>

      <div className='rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between px-3 py-2 backdrop-blur-sm'>
        <button
          onClick={handlePrev}
          disabled={!executionResult || currentStep === minStep}
          className='px-5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] disabled:opacity-40
  transition-all duration-200 text-zinc-200 text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0'
        >
          Prev
        </button>
        <button
          onClick={handleVisualize}
          disabled={isLoading}
          className='px-6 py-2 rounded-xl bg-white hover:bg-gray-100 disabled:opacity-50
  transition-all duration-200 text-black text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:hover:translate-y-0 border-0'
        >
          {isLoading ? 'Loading...' : 'Visualize'}
        </button>
        <button
          onClick={handleNext}
          disabled={!executionResult || currentStep >= totalSteps - 1}
          className='px-5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] disabled:opacity-40
  transition-all duration-200 text-zinc-200 text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0'
        >
          Next
        </button>
      </div>
    </div>
  );
}
