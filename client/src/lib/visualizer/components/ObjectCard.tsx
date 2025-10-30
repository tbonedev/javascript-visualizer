'use client';

import { ParsedObject } from '../types';

interface ObjectCardProps {
  object: ParsedObject;
  isHovered?: boolean;
}

export function ObjectCard({ object, isHovered }: ObjectCardProps) {
  // Цвет рамки и свечения по типу объекта
  const getBorderColor = () => {
    switch (object.type) {
      case 'array':
        return 'border-blue-400/50';
      case 'object':
        return 'border-emerald-400/50';
      case 'function':
        return 'border-amber-400/50';
      default:
        return 'border-white/[0.08]';
    }
  };

  const getShadowColor = () => {
    switch (object.type) {
      case 'array':
        return 'shadow-blue-500/20';
      case 'object':
        return 'shadow-emerald-500/20';
      case 'function':
        return 'shadow-amber-500/20';
      default:
        return 'shadow-none';
    }
  };

  // Заголовок карточки
  const getTitle = () => {
    if (object.type === 'array' && Array.isArray(object.data)) {
      return `Array (${object.data.length})`;
    }
    if (object.type === 'function') {
      return 'Function';
    }
    return 'Object';
  };

  // Рендерим содержимое массива
  const renderArray = (arr: unknown[]) => {
    return (
      <>
        {arr.map((item, index) => (
          <div key={index} className='py-1'>
            <span className='text-zinc-400'>[{index}]:</span>{' '}
            <span className='text-zinc-100'>{String(item)}</span>
          </div>
        ))}
        <div className='border-t border-white/[0.08] my-1'></div>
        <div className='py-1'>
          <span className='text-zinc-400'>length:</span>{' '}
          <span className='text-zinc-100'>{arr.length}</span>
        </div>
      </>
    );
  };

  // Рендерим содержимое объекта
  const renderObject = (obj: Record<string, unknown>) => {
    return (
      <>
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className='py-1'>
            <span className='text-zinc-400'>{key}:</span>{' '}
            <span className='text-zinc-100'>{String(value)}</span>
          </div>
        ))}
      </>
    );
  };

  return (
    <div
      className={`rounded-xl border-2 ${getBorderColor()} ${getShadowColor()} bg-white/[0.03] overflow-hidden transition-all duration-200 backdrop-blur-sm shadow-lg ${
        isHovered ? 'ring-2 ring-blue-400/50 scale-105 shadow-xl' : ''
      }`}
    >
      {/* Header */}
      <div className='px-3 py-2 border-b border-white/[0.08] bg-white/[0.02] flex items-center gap-2'>
        <span className='font-mono text-xs text-blue-400 font-semibold'>{object.id}</span>
        <span className='text-zinc-500'>•</span>
        <span className='text-sm text-zinc-200 font-medium'>{getTitle()}</span>
      </div>

      {/* Body */}
      <div className='p-3 font-mono text-xs'>
        {object.type === 'array' &&
          Array.isArray(object.data) &&
          renderArray(object.data)}
        {object.type === 'object' &&
          typeof object.data === 'object' &&
          object.data !== null &&
          !Array.isArray(object.data) &&
          renderObject(object.data as Record<string, unknown>)}
        {object.type === 'function' && (
          <div className='text-zinc-400 italic'>function() {'{ ... }'}</div>
        )}
      </div>
    </div>
  );
}
