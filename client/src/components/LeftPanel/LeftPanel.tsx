import Logo from '../Logo/Logo';
import Chat from './Chat/Chat';

export default function LeftPanel() {
  return (
    <div className='flex flex-col h-full items-center'>
      <Logo />
      <Chat />
    </div>
  );
}
