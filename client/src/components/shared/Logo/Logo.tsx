import Link from 'next/link';

export default function Logo() {
  return (
    <div className='flex justify-center items-center w-full bg-[#0d0d0d]'>
      <Link href='/' className='cursor-pointer transition-all duration-200 hover:scale-105'>
        <h1 className='text-3xl font-bold text-white py-6'>
          JavaScript Visualizer
        </h1>
      </Link>
    </div>
  );
}
