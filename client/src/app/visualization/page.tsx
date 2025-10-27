import LeftPanel from '@/components/visualization/LeftPanel/LeftPanel';
import RightPanel from '@/components/visualization/RightPanel/RightPanel';
import Logo from '@/components/shared/Logo/Logo';
export default function Visualize() {
  return (
    <div className='px-[50px] py-[50px] h-screen'>
      <div className='flex gap-5 h-full'>
        <div className='flex-[1] flex flex-col gap-5'>
          <div className='rounded-3xl overflow-hidden border border-zinc-300 dark:border-zinc-800'>
            <Logo />
          </div>
          <div className='flex-1 rounded-3xl overflow-hidden border border-zinc-300 dark:border-zinc-800'>
            <LeftPanel />
          </div>
        </div>
        <div className='flex-[2] rounded-3xl overflow-hidden border border-zinc-300 dark:border-zinc-800'>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
