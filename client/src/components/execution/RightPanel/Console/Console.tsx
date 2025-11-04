'use client';

export default function Console() {
  return (
    <div className='h-full rounded-2xl bg-[#1a1a1a]/90 border border-white/[0.08] overflow-hidden flex flex-col backdrop-blur-xl shadow-2xl'>
      <div className='bg-white/[0.03] px-3 py-2 border-b border-white/[0.08]'>
        <span className='text-zinc-300 text-xs font-semibold'>Console</span>
      </div>
      <div className='flex-1 overflow-y-auto p-3'>
        <div className='font-mono text-xs text-zinc-300'>
          {/* Console output will go here */}
          <div className='text-emerald-400'>Ready</div>
        </div>
      </div>
    </div>
  );
}
