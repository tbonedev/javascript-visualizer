'use client';

import { useState } from 'react';
import { ExecutionStep } from '../types';
import { parseExecutionStep } from '../parseExecutionStep';
import { FramesPanel } from '../FramesPanel';
import { ObjectsPanel } from './ObjectsPanel';

interface VisualizerProps {
  executionStep: ExecutionStep | null;
}

export function Visualizer({ executionStep }: VisualizerProps) {
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);

  // Если нет данных - показываем placeholder
  if (!executionStep) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-zinc-300 text-lg mb-2 font-medium'>No execution data</p>
          <p className='text-zinc-400 text-sm'>
            Click &quot;Visualize&quot; to execute code
          </p>
        </div>
      </div>
    );
  }

  // Парсим данные
  const visualizationData = parseExecutionStep(executionStep);

  return (
    <div className='h-full flex'>
      {/* Left: Frames Panel (35%) */}
      <div className='w-[35%] border-r border-white/[0.08]'>
        <FramesPanel
          frames={visualizationData.frames}
          onVariableHover={setHoveredObjectId}
        />
      </div>

      {/* Right: Objects Panel (65%) */}
      <div className='flex-1'>
        <ObjectsPanel
          objects={visualizationData.objects}
          hoveredObjectId={hoveredObjectId}
        />
      </div>
    </div>
  );
}
