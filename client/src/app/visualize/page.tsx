import LeftPanel from '@/components/LeftPanel/LeftPanel';
import RightPanel from '@/components/RightPanel/RightPanel';

export default function Visualize() {
  return (
    <div className='px-[100px] h-screen'>
      <div className='flex h-full'>
        <div className='flex-[1] border-l border-r border-zinc-300 dark:border-zinc-800 overflow-hidden'>
          <LeftPanel />
        </div>
        <div className='flex-[2] overflow-hidden'>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
