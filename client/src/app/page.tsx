import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-[#0d0d0d]'>
      <main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start'>
        <Image
          className='dark:invert'
          src='/next.svg'
          alt='Next.js logo'
          width={480}
          height={288}
          priority
        />
        <ol className='font-mono list-inside text-sm/6 text-center sm:text-left'>
          <li className='mb-2 tracking-[-.01em] text-zinc-300'>
            Get started by clicking on of the 2 following buttons.{' '}
          </li>
        </ol>

        <div className='flex gap-4 items-center flex-col sm:flex-row'>
          <Link
            className='rounded-2xl border-0 transition-all duration-200 flex items-center justify-center bg-white hover:bg-gray-100 text-black hover:text-black visited:text-black gap-2 font-semibold text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-[180px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 no-underline'
            href='/visualization'
          >
            <Image
              className='brightness-0'
              src='/top-arrow.svg'
              alt='Vercel logomark'
              width={20}
              height={20}
            />
            Visualize code
          </Link>
          <Link
            className='rounded-2xl border border-white/[0.08] gap-2 transition-all duration-200 flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.08] hover:border-white/[0.12] text-zinc-200 font-semibold text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-[180px] hover:shadow-lg hover:-translate-y-0.5'
            href='/execution'
          >
            Execute code
            <Image
              className='invert'
              src='/bottom-arrow.svg'
              alt='Vercel logomark'
              width={20}
              height={20}
            />
          </Link>
        </div>
      </main>
      <footer className='row-start-3 flex gap-[24px] flex-wrap items-center justify-center'>
        <a
          className='flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors duration-200 hover:underline hover:underline-offset-4'
          href='https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
          target='_blank'
          rel='noopener noreferrer'
        >
          <Image
            aria-hidden
            src='/file.svg'
            alt='File icon'
            width={16}
            height={16}
            className='invert opacity-70'
          />
          Learn →
        </a>
        <a
          className='flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors duration-200 hover:underline hover:underline-offset-4'
          href='https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
          target='_blank'
          rel='noopener noreferrer'
        >
          <Image
            aria-hidden
            src='/window.svg'
            alt='Window icon'
            width={16}
            height={16}
            className='invert opacity-70'
          />
          Examples →
        </a>

        <a
          className='flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors duration-200 hover:underline hover:underline-offset-4'
          href='https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
          target='_blank'
          rel='noopener noreferrer'
        >
          <Image
            aria-hidden
            src='/algorithm.svg'
            alt='Globe icon'
            width={16}
            height={16}
            className='invert opacity-70'
          />
          Common algorithms →
        </a>
        <a
          className='flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors duration-200 hover:underline hover:underline-offset-4'
          href='https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
          target='_blank'
          rel='noopener noreferrer'
        >
          <Image
            aria-hidden
            src='/minecraft-black-heart.png'
            alt='Heart icon'
            width={16}
            height={16}
            className='invert opacity-70'
          />
          Made with love by tbonedev →
        </a>
        <a
          className='flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors duration-200 hover:underline hover:underline-offset-4'
          href='https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
          target='_blank'
          rel='noopener noreferrer'
        >
          <Image
            aria-hidden
            src='/globe.svg'
            alt='Globe icon'
            width={16}
            height={16}
            className='invert opacity-70'
          />
          Donate any blockhain →
        </a>
      </footer>
    </div>
  );
}
