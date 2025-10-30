import Image from 'next/image';
import Link from 'next/link';

export default function Logo() {
  return (
    <div className='flex justify-center items-center w-full pl-[80px] border-b border-white/[0.08] bg-white/[0.02]'>
      <Link href='/' className='cursor-pointer transition-all duration-200 hover:scale-105'>
        <Image
          className='dark:invert'
          src='/next.svg'
          alt='Next.js logo'
          width={480}
          height={288}
          priority
        />
      </Link>
    </div>
  );
}
