'use client';

import { ParsedObject } from '../types';
import { ObjectCard } from './ObjectCard';

interface ObjectsPanelProps {
  objects: ParsedObject[];
  hoveredObjectId?: string | null;
}

export function ObjectsPanel({ objects, hoveredObjectId }: ObjectsPanelProps) {
  if (objects.length === 0) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-zinc-400 text-sm'>No objects to display</p>
      </div>
    );
  }

  // Группируем объекты по зонам
  const dataStructures = objects.filter(
    (obj) => obj.zone === 'data-structures'
  );
  const plainObjects = objects.filter((obj) => obj.zone === 'objects');
  const functions = objects.filter((obj) => obj.zone === 'functions');

  return (
    <div className='h-full overflow-y-auto p-4 space-y-4'>
      {/* Data Structures Zone */}
      {dataStructures.length > 0 && (
        <div>
          <h3 className='text-xs font-bold text-zinc-400 uppercase mb-2 tracking-wider'>
            Data Structures
          </h3>
          <div className='flex flex-wrap gap-3'>
            {dataStructures.map((obj) => (
              <ObjectCard
                key={obj.id}
                object={obj}
                isHovered={hoveredObjectId === obj.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Objects Zone */}
      {plainObjects.length > 0 && (
        <div>
          <h3 className='text-xs font-bold text-zinc-400 uppercase mb-2 tracking-wider'>
            Objects
          </h3>
          <div className='flex flex-wrap gap-3'>
            {plainObjects.map((obj) => (
              <ObjectCard
                key={obj.id}
                object={obj}
                isHovered={hoveredObjectId === obj.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Functions Zone */}
      {functions.length > 0 && (
        <div>
          <h3 className='text-xs font-bold text-zinc-400 uppercase mb-2 tracking-wider'>
            Functions
          </h3>
          <div className='flex flex-wrap gap-3'>
            {functions.map((obj) => (
              <ObjectCard
                key={obj.id}
                object={obj}
                isHovered={hoveredObjectId === obj.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
