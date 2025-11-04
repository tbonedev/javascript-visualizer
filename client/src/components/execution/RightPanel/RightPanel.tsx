import { Visualizer } from '@/lib/visualizer/components/Visualizer';

interface RightPanelProps {
  executionStep: any;
}
export default function RightPanel({ executionStep }: RightPanelProps) {
  // Если нет данных - показываем один placeholder для всей панели
  if (!executionStep) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-zinc-300 text-lg mb-2 font-medium'>
            No execution data
          </p>
          <p className='text-zinc-400 text-sm'>
            Click &quot;Visualize&quot; to execute code
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      {/* Sync Visualization (Frames + Objects) - Top 300px */}
      <div className='h-[300px] border-b border-white/[0.08]'>
        <Visualizer executionStep={executionStep} />
      </div>

      {/* Async Visualization (Event Loop) - Bottom (remaining space) */}
      <div className='flex-1 p-4'>
        <div className='h-full flex flex-col gap-4'>
          {/* Top Row */}
          <div className='flex-1 flex gap-4'>
            {/* Call Stack - Left */}
            <div
              className='flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 overflow-hidden backdrop-blur-sm 
  shadow-lg'
            >
              <h3 className='text-zinc-300 text-sm font-semibold mb-2'>
                Call Stack
              </h3>
            </div>
            {/* Web APIs - Right */}
            <div
              className='flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 overflow-hidden backdrop-blur-sm 
  shadow-lg'
            >
              <h3 className='text-zinc-300 text-sm font-semibold mb-2'>
                Web APIs
              </h3>
            </div>
          </div>

          {/* Bottom Row */}
          <div className='flex-1 flex gap-4'>
            {/* Event Loop - Left */}
            <div
              className='flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 overflow-hidden backdrop-blur-sm 
  shadow-lg'
            >
              <h3 className='text-zinc-300 text-sm font-semibold mb-2'>
                Event Loop
              </h3>
            </div>
            {/* Queues - Right */}
            <div
              className='flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 overflow-hidden backdrop-blur-sm 
  shadow-lg'
            >
              <h3 className='text-zinc-300 text-sm font-semibold mb-3'>
                Queues
              </h3>
              <div className='flex flex-col gap-2 h-[calc(100%-2rem)]'>
                <div className='flex-1 rounded-lg bg-white/[0.05] border border-white/[0.08] p-2'>
                  <h4 className='text-zinc-300 text-xs font-semibold'>
                    Macro Task Queue
                  </h4>
                </div>
                <div className='flex-1 rounded-lg bg-white/[0.05] border border-white/[0.08] p-2'>
                  <h4 className='text-zinc-300 text-xs font-semibold'>
                    Micro Task Queue
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
