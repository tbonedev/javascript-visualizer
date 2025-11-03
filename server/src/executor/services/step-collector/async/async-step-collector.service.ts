import { Injectable } from '@nestjs/common';
import { AsyncOperationType } from './interfaces/async-execution-step.interface';

/**
 * Async Operation Detector Service
 * Обнаруживает асинхронные операции в коде (но НЕ выполняет их callbacks)
 *
 * Роль: регистрация async операций для Event Loop визуализации
 */
@Injectable()
export class AsyncStepCollectorService {
  // Map line number -> async operation type (detected during sync execution)
  private asyncLinesMap = new Map<number, AsyncOperationType>();

  constructor() {}

  /**
   * Регистрирует async операцию (но НЕ выполняет callback)
   * Просто помечает строку как async для Event Loop визуализации
   */
  registerAsyncOperation(lineNumber: number, type: AsyncOperationType): void {
    this.asyncLinesMap.set(lineNumber, type);
    console.log(`📝 Registered async operation: ${type} at line ${lineNumber}`);
  }

  /**
   * Перевіряє чи лінія коду є асинхронною операцією
   */
  isAsyncLine(code: string): { isAsync: boolean; type?: AsyncOperationType } {
    const trimmedCode = code.trim();

    // setTimeout / setInterval
    if (trimmedCode.includes('setTimeout')) {
      return { isAsync: true, type: 'setTimeout' };
    }
    if (trimmedCode.includes('setInterval')) {
      return { isAsync: true, type: 'setInterval' };
    }

    // Promise
    if (trimmedCode.includes('.then(')) {
      return { isAsync: true, type: 'Promise.then' };
    }
    if (trimmedCode.includes('.catch(')) {
      return { isAsync: true, type: 'Promise.catch' };
    }
    if (trimmedCode.includes('.finally(')) {
      return { isAsync: true, type: 'Promise.finally' };
    }

    // async/await
    if (trimmedCode.startsWith('await ')) {
      return { isAsync: true, type: 'async/await' };
    }

    // Microtask API
    if (trimmedCode.includes('queueMicrotask')) {
      return { isAsync: true, type: 'queueMicrotask' };
    }
    if (trimmedCode.includes('process.nextTick')) {
      return { isAsync: true, type: 'process.nextTick' };
    }
    if (trimmedCode.includes('setImmediate')) {
      return { isAsync: true, type: 'setImmediate' };
    }

    return { isAsync: false };
  }

  /**
   * Получает тип async операции для конкретной строки
   */
  getAsyncOperationType(lineNumber: number): AsyncOperationType | undefined {
    return this.asyncLinesMap.get(lineNumber);
  }

  /**
   * Скидає стан
   */
  reset(): void {
    this.asyncLinesMap.clear();
  }
}
