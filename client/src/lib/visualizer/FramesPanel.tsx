'use client';

import { ParsedFrame } from './types';
import { Frame } from './Frame';

interface FramesPanelProps {
  frames: ParsedFrame[];
  onVariableHover?: (objectId: string | null) => void;
}
export function FramesPanel({ frames, onVariableHover }: FramesPanelProps) {
  if (frames.length === 0) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-zinc-400 text-sm'>No frames to display</p>
      </div>
    );
  }

  return (
    <div className='h-full overflow-y-auto p-4 space-y-3'>
      {frames.map((frame, index) => (
        <Frame
          key={`${frame.type}-${index}`}
          frame={frame}
          onVariableHover={onVariableHover}
        />
      ))}
    </div>
  );
}
