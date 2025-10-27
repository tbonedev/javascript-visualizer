'use client';

import CodeEditor from './CodeEditor';
import { useState } from 'react';

export default function LeftPanel() {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 10; // Общее количество шагов

  const handleStepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentStep(parseInt(e.target.value));
  };

  return (
    <div className='flex flex-col h-full p-2.5'>
      <div className='h-[400px] rounded-3xl overflow-hidden border border-zinc-300 dark:border-zinc-800'>
        <CodeEditor />
      </div>
      <div className='flex-1'></div>

      {/* Execution indicators */}
      <div className='flex flex-col gap-2 mb-2'>
        <div className='flex items-center gap-2'>
          <span className='text-green-500 text-3xl leading-none -translate-y-1'>
            →
          </span>
          <span className='text-zinc-400 text-sm'>Current line</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-red-500 text-3xl leading-none -translate-y-1'>
            →
          </span>
          <span className='text-zinc-400 text-sm'>Next line</span>
        </div>
      </div>

      {/* Step Slider */}
      <div className='flex items-center gap-3 mb-2.5'>
        <span className='text-zinc-400 text-sm'>Step</span>
        <input
          type='range'
          min='0'
          max={totalSteps - 1}
          value={currentStep}
          onChange={handleStepChange}
          className='flex-1 h-[12px] bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none 
  [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full 
  [&::-webkit-slider-thumb]:bg-zinc-600 [&::-webkit-slider-thumb]:cursor-pointer'
        />
        <span className='text-zinc-400 text-sm font-mono'>
          {currentStep + 1}/{totalSteps}
        </span>
      </div>

      {/* Buttons */}
      <div className='rounded-2xl bg-[#282c34] border border-zinc-700 flex items-center justify-between px-3 py-2'>
        <button
          className='px-4 py-1.5 rounded-lg bg-[#21252b] border border-zinc-700 hover:bg-[#2c313a] transition-colors 
  text-zinc-200 text-sm'
        >
          Prev
        </button>
        <button
          className='px-4 py-1.5 rounded-lg bg-[#21252b] border border-zinc-700 hover:bg-[#2c313a] transition-colors 
  text-zinc-200 text-sm'
        >
          Visualize
        </button>
        <button
          className='px-4 py-1.5 rounded-lg bg-[#21252b] border border-zinc-700 hover:bg-[#2c313a] transition-colors 
  text-zinc-200 text-sm'
        >
          Next
        </button>
      </div>
    </div>
  );
}
