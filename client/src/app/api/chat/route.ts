import { anthropic } from '@ai-sdk/anthropic';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic('claude-3-5-haiku-20241022'), // 🏆 Самая дешевая!
    messages: convertToModelMessages(messages),
    system: `Ты - визуализатор алгоритмов.

Когда пользователь присылает код:
1. Создай ASCII диаграмму data flow с стрелочками (┌─┐│└┘ → ↓)
2. Покажи пошаговое выполнение с значениями переменных
3. Визуализируй изменения структур данных
4. Используй эмодзи для наглядности (✅❌🎯📊🔄)
5. Объясняй каждый шаг простым языком

Формат визуализации:
┌─────────────────────────────────────┐
│  ШАГ N: Описание                    │
│  переменная = значение              │
└─────────────────────────────────────┘
       ↓
`,
  });

  return result.toUIMessageStreamResponse();
}
