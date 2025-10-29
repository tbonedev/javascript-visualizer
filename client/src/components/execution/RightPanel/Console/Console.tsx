'use client';

export default function Console() {
  return (
    <div className='absolute bottom-2.5 left-2.5 w-[300px] h-[250px] rounded-[10px] bg-[#1e1e1e] border border-zinc-700 overflow-hidden flex flex-col'>
      <div className='bg-[#2d2d2d] px-3 py-2 border-b border-zinc-700'>
        <span className='text-zinc-400 text-xs font-medium'>Console</span>
      </div>
      <div className='flex-1 overflow-y-auto p-2'>
        <div className='font-mono text-xs text-zinc-300'>
          {/* Console output will go here */}
          <div className='text-zinc-500'>Ready</div>
        </div>
      </div>
    </div>
  );
}
