'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconArrowUp } from '@/components/ui/icons';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();

  return (
    <div className='flex flex-col w-full h-full'>
      <div className='flex-1 overflow-y-auto px-4 pt-6 pb-4'>
        {messages.length === 0 ? (
          <div className='flex items-center justify-center h-full text-muted-foreground'>
            <p>Start a conversation...</p>
          </div>
        ) : (
          <div className='max-w-xl mx-auto'>
            {messages.map((message) => (
              <div key={message.id} className='whitespace-pre-wrap flex mb-5'>
                <div
                  className={`${
                    message.role === 'user'
                      ? 'bg-slate-200 dark:bg-slate-800 ml-auto'
                      : 'bg-transparent'
                  } p-2 rounded-lg`}
                >
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <div key={`${message.id}-${i}`}>{part.text}</div>
                        );
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='w-full px-4 pb-4'>
        <div className='max-w-xl mx-auto'>
          <Card className='p-2'>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput('');
                }
              }}
            >
              <div className='flex'>
                <Input
                  type='text'
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value);
                  }}
                  className='w-[95%] mr-2 border-0 ring-offset-0 focus-visible:ring-0 focus-visible:outline-none focus:outline-none focus:ring-0 ring-0 focus-visible:border-none border-transparent focus:border-transparent focus-visible:ring-none'
                  placeholder='Ask me anything...'
                />
                <Button disabled={!input.trim()}>
                  <IconArrowUp />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
