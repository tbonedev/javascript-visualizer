import LeftPanel from '@/components/visualization/LeftPanel/LeftPanel';
import RightPanel from '@/components/visualization/RightPanel/RightPanel';
import Logo from '@/components/shared/Logo/Logo';
export default function Visualize() {
  return (
    <div className='px-[50px] py-[50px] h-screen bg-[#0d0d0d]'>
      <div className='flex gap-5 h-full'>
        <div className='flex-[1] flex flex-col gap-5'>
          <div className='rounded-3xl overflow-hidden border border-white/[0.08] bg-white backdrop-blur-xl shadow-lg'>
            <Logo />
          </div>
          <div className='flex-1 rounded-3xl overflow-hidden border border-white/[0.08] bg-[#1a1a1a]/80 backdrop-blur-xl shadow-2xl'>
            <LeftPanel />
          </div>
        </div>
        <div className='flex-[2] rounded-3xl overflow-hidden border border-white/[0.08] bg-[#1a1a1a]/80 backdrop-blur-xl shadow-2xl'>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
