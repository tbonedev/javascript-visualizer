import Image from 'next/image';
import Link from 'next/link';

export default function Logo() {
  return (
    <div className='flex justify-center items-center w-full pl-[80px] border-b'>
      <Link href='/' className='cursor-pointer'>
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
