'use client';
import { ParsedVariable } from './types';
import { formatPrimitiveValue } from './objectUtils';

interface VariableProps {
  variable: ParsedVariable;
  onHover?: (objectId: string | null) => void;
}

export function Variable({ variable, onHover }: VariableProps) {
  const handleMouseEnter = () => {
    if (variable.objectId && onHover) {
      onHover(variable.objectId);
    }
  };

  const handleMouseLeave = () => {
    if (onHover) {
      onHover(null);
    }
  };

  return (
    <div
      className='flex items-center gap-2 py-1 px-2 rounded hover:bg-zinc-800/50 transition-colors'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className='font-mono text-sm text-zinc-300'>{variable.name}</span>
      {variable.isPrimitive ? (
        <span className='font-mono text-sm text-zinc-400'>
          : {formatPrimitiveValue(variable.value)}
        </span>
      ) : (
        <>
          <span className='text-zinc-500'>────►</span>
          <span className='font-mono text-xs text-blue-400'>
            {variable.objectId}
          </span>
        </>
      )}
    </div>
  );
}
