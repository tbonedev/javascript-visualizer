'use client';

import { ParsedObject } from '../types';

interface ObjectCardProps {
  object: ParsedObject;
  isHovered?: boolean;
}

export function ObjectCard({ object, isHovered }: ObjectCardProps) {
  // Цвет рамки по типу объекта
  const getBorderColor = () => {
    switch (object.type) {
      case 'array':
        return 'border-blue-500';
      case 'object':
        return 'border-green-500';
      case 'function':
        return 'border-yellow-500';
      default:
        return 'border-zinc-600';
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
            <span className='text-zinc-200'>{String(item)}</span>
          </div>
        ))}
        <div className='border-t border-zinc-700 my-1'></div>
        <div className='py-1'>
          <span className='text-zinc-400'>length:</span>{' '}
          <span className='text-zinc-200'>{arr.length}</span>
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
            <span className='text-zinc-200'>{String(value)}</span>
          </div>
        ))}
      </>
    );
  };

  return (
    <div
      className={`rounded-lg border-2 ${getBorderColor()} bg-[#3d3d3d] overflow-hidden transition-all ${
        isHovered ? 'ring-2 ring-blue-400 scale-105' : ''
      }`}
    >
      {/* Header */}
      <div className='px-3 py-2 border-b border-zinc-700 bg-[#2d2d2d] flex items-center gap-2'>
        <span className='font-mono text-xs text-blue-400'>{object.id}</span>
        <span className='text-zinc-500'>•</span>
        <span className='text-sm text-zinc-300'>{getTitle()}</span>
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
