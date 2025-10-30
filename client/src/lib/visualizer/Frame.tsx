'use client';

import { ParsedFrame } from './types';
import { Variable } from './Variable';

interface FrameProps {
  frame: ParsedFrame;
  onVariableHover?: (objectId: string | null) => void;
}

export function Frame({ frame, onVariableHover }: FrameProps) {
  const getFrameTitle = () => {
    switch (frame.type) {
      case 'global':
        return 'Global frame';
      case 'closure':
        return frame.functionName
          ? `Closure: ${frame.functionName}`
          : 'Closure frame';
      case 'local':
        return frame.functionName
          ? `${frame.functionName} (Local frame)`
          : 'Local frame';
    }
  };
  const getHeaderColor = () => {
    switch (frame.type) {
      case 'global':
        return 'text-blue-400';
      case 'closure':
        return 'text-purple-400';
      case 'local':
        return 'text-green-400';
    }
  };

  return (
    <div className='rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden backdrop-blur-sm shadow-lg'>
      {/* Header */}
      <div className='px-3 py-2 border-b border-white/[0.08] bg-white/[0.02]'>
        <h3 className={`text-sm font-bold ${getHeaderColor()}`}>
          {getFrameTitle()}
        </h3>
      </div>

      {/* Variables */}
      <div className='p-2 space-y-1'>
        {frame.variables.length > 0 ? (
          frame.variables.map((variable) => (
            <Variable
              key={variable.name}
              variable={variable}
              onHover={onVariableHover}
            />
          ))
        ) : (
          <div className='text-zinc-400 text-xs italic py-2 px-2'>(empty)</div>
        )}
      </div>
    </div>
  );
}
