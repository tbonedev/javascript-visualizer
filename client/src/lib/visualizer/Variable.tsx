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
      className='flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-white/[0.05] transition-all duration-150 cursor-pointer'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className='font-mono text-sm text-zinc-200 font-medium'>{variable.name}</span>
      {variable.isPrimitive ? (
        <span className='font-mono text-sm text-zinc-400'>
          : {formatPrimitiveValue(variable.value)}
        </span>
      ) : (
        <>
          <span className='text-zinc-500'>────►</span>
          <span className='font-mono text-xs text-blue-400 font-semibold'>
            {variable.objectId}
          </span>
        </>
      )}
    </div>
  );
}
