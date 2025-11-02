import { Injectable } from '@nestjs/common';
import inspector from 'inspector';
import {
  AsyncExecutionStep,
  AsyncOperationType,
  AsyncOperationInfo,
} from './async-execution-step.interface';
import { V8InspectorService } from '../../v8-inspector/v8-inspector.service';
import { ScopeExtractorService } from '../shared/scope-extractor.service';
import { StackFrame } from '../shared/stack-frame.interface';
import { AsyncHooksService } from '../../async-hooks/async-hooks.service';

/**
 * Async Step Collector Service
 * Збирає execution steps для асинхронного коду (callbacks, promises, etc.)
 */
@Injectable()
export class AsyncStepCollectorService {
  private asyncSteps: AsyncExecutionStep[] = [];
  private stepCounter: number = 0;
  private processingQueue: Promise<void> = Promise.resolve();

  // Map asyncId -> async operation info
  private asyncOperations = new Map<number, AsyncOperationInfo>();

  // Map line number -> async operation type (detected during sync execution)
  private asyncLinesMap = new Map<number, AsyncOperationType>();

  private readonly MAX_STEPS = 1001;

  constructor(
    private readonly v8Inspector: V8InspectorService,
    private readonly scopeExtractor: ScopeExtractorService,
    private readonly asyncHooks: AsyncHooksService,
  ) {}

  /**
   * Регіструє асинхронну операцію на певній лінії коду
   * Викликається під час синхронного виконання коли зустрічаємо async код
   */
  registerAsyncOperation(
    lineNumber: number,
    code: string,
    type: AsyncOperationType,
    asyncId?: number,
    delay?: number,
  ): void {
    this.asyncLinesMap.set(lineNumber, type);

    if (asyncId) {
      const info: AsyncOperationInfo = {
        type,
        asyncId,
        scheduledAt: {
          line: lineNumber,
          code,
        },
        delay,
      };
      this.asyncOperations.set(asyncId, info);
      console.log(`📝 Registered async operation: ${type} at line ${lineNumber}, asyncId=${asyncId}`);
    }
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
   * Обробляє паузу під час виконання async callback
   */
  async handleAsyncPause(
    params: inspector.Debugger.PausedEventDataType,
    codeLines: string[],
  ): Promise<void> {
    this.processingQueue = this.processingQueue.then(() =>
      this.processAsyncPause(params, codeLines),
    );

    return this.processingQueue;
  }

  /**
   * Внутрішній метод для обробки async паузи
   */
  private async processAsyncPause(
    params: inspector.Debugger.PausedEventDataType,
    codeLines: string[],
  ): Promise<void> {
    console.log('🔄 Processing ASYNC pause:', {
      reason: params.reason,
      hasAsyncStackTrace: !!params.asyncStackTrace,
      asyncStackTraceId: params.asyncStackTraceId,
    });

    // Перевірка наявності call frames
    if (!params.callFrames || params.callFrames.length === 0) {
      console.log('⚠️  No call frames, skipping...');
      try {
        await this.v8Inspector.post('Debugger.stepOver');
      } catch (error) {
        if (error.code !== 'ERR_INSPECTOR_COMMAND') throw error;
      }
      return;
    }

    const currentFrame = params.callFrames[0];
    const location = currentFrame.location;
    let lineNumber = location.lineNumber;

    console.log(`🔍 ASYNC pause at line ${lineNumber} (codeLines.length: ${codeLines.length})`);

    // Якщо лінія за межами користувацького коду, спробуємо знайти лінію через async stack trace
    if (lineNumber < 0 || lineNumber >= codeLines.length) {
      console.log(`⚠️  Line ${lineNumber} out of bounds, checking async stack trace...`);

      // Шукаємо лінію в async stack trace (перебираємо ВСІ рівні)
      if (params.asyncStackTrace && params.asyncStackTrace.callFrames.length > 0) {
        let foundValidLine = false;

        for (const asyncFrame of params.asyncStackTrace.callFrames) {
          const asyncLineNumber = asyncFrame.lineNumber;
          console.log(`🔍 Checking async stack frame line: ${asyncLineNumber}`);

          if (asyncLineNumber >= 0 && asyncLineNumber < codeLines.length) {
            lineNumber = asyncLineNumber;
            foundValidLine = true;
            console.log(`✅ Using async stack trace line: ${lineNumber}`);
            break;
          }
        }

        if (!foundValidLine) {
          console.log(`⚠️  No valid line found in async stack trace, skipping...`);
          try {
            await this.v8Inspector.post('Debugger.stepOver');
          } catch (error) {
            if (error.code !== 'ERR_INSPECTOR_COMMAND') throw error;
          }
          return;
        }
      } else {
        console.log(`⚠️  No async stack trace available, skipping...`);
        try {
          await this.v8Inspector.post('Debugger.stepOver');
        } catch (error) {
          if (error.code !== 'ERR_INSPECTOR_COMMAND') throw error;
        }
        return;
      }
    }

    const codeLine = codeLines[lineNumber] || '';

    // Пропускаємо пусті строки
    if (codeLine.trim().length === 0) {
      try {
        await this.v8Inspector.post('Debugger.stepOver');
      } catch (error) {
        if (error.code !== 'ERR_INSPECTOR_COMMAND') throw error;
      }
      return;
    }

    console.log(`⏸️  [ASYNC] Paused at line ${lineNumber}: "${codeLine.trim()}"`);

    if (this.stepCounter >= this.MAX_STEPS) {
      console.warn(`⚠️  Reached maximum ASYNC steps limit: ${this.MAX_STEPS}`);
      try {
        await this.v8Inspector.post('Debugger.stepOver');
      } catch (error) {
        if (error.code !== 'ERR_INSPECTOR_COMMAND') throw error;
      }
      return;
    }

    // Витягуємо scope
    const scope = await this.scopeExtractor.extractScope(currentFrame);

    // Визначаємо тип async операції
    const asyncOperationInfo = this.detectAsyncOperation(
      params,
      lineNumber,
      codeLine,
    );

    // Витягуємо async stack trace якщо є
    const asyncStackTrace = this.extractAsyncStackTrace(params.asyncStackTrace);

    // Створюємо async execution step
    const step: AsyncExecutionStep = {
      step: this.stepCounter++,
      line: lineNumber,
      code: codeLine.trim(),
      scope,
      callStack: this.buildCallStack(params.callFrames),
      eventLoop: this.asyncHooks.getEventLoopState(),
      asyncOperation: asyncOperationInfo,
      asyncStackTrace,
      asyncStackTraceId: params.asyncStackTraceId
        ? JSON.stringify(params.asyncStackTraceId)
        : undefined,
    };

    this.asyncSteps.push(step);
    console.log(`✅ [ASYNC] Step ${step.step} collected`);

    try {
      await this.v8Inspector.post('Debugger.stepOver');
    } catch (error) {
      if (error.code !== 'ERR_INSPECTOR_COMMAND') throw error;
    }
  }

  /**
   * Визначає тип async операції з pause event
   */
  private detectAsyncOperation(
    params: inspector.Debugger.PausedEventDataType,
    lineNumber: number,
    code: string,
  ): AsyncOperationInfo {
    // Спробуємо знайти зареєстровану операцію
    const registeredType = this.asyncLinesMap.get(lineNumber);

    // Або визначаємо по коду
    const { type } = this.isAsyncLine(code);

    const operationType = registeredType || type || 'setTimeout'; // fallback

    // Спробуємо знайти scheduledAt через async stack trace
    let scheduledAt = { line: lineNumber, code: code.trim() };

    if (params.asyncStackTrace && params.asyncStackTrace.callFrames.length > 0) {
      const asyncFrame = params.asyncStackTrace.callFrames[0];
      scheduledAt = {
        line: asyncFrame.lineNumber,
        code: `Scheduled from line ${asyncFrame.lineNumber}`,
      };
    }

    return {
      type: operationType,
      scheduledAt,
    };
  }

  /**
   * Витягує async stack trace з V8 Inspector
   */
  private extractAsyncStackTrace(
    asyncStackTrace?: inspector.Runtime.StackTrace,
  ): StackFrame[] | undefined {
    if (!asyncStackTrace || !asyncStackTrace.callFrames) {
      return undefined;
    }

    return asyncStackTrace.callFrames.map((frame) => ({
      functionName: frame.functionName || '(anonymous)',
      line: frame.lineNumber,
      column: frame.columnNumber,
    }));
  }

  /**
   * Будує call stack
   */
  private buildCallStack(
    callFrames: inspector.Debugger.CallFrame[],
  ): StackFrame[] {
    if (callFrames.length === 0) return [];

    // Знаходимо максимальний scriptId (це користувацький код)
    const userScriptId = Math.max(
      ...callFrames.map((f) => parseInt(f.location.scriptId, 10)),
    ).toString();

    // Фільтруємо тільки фрейми з користувацького коду
    return callFrames
      .filter((frame) => frame.location.scriptId === userScriptId)
      .map((frame) => ({
        functionName: frame.functionName || '(anonymous)',
        line: frame.location.lineNumber,
        column: frame.location.columnNumber || 0,
      }));
  }

  /**
   * Повертає зібрані async steps
   */
  getAsyncSteps(): AsyncExecutionStep[] {
    console.log('📊 Final ASYNC steps count:', this.asyncSteps.length);
    this.asyncSteps.forEach((step, index) => {
      console.log(`   [ASYNC] Step ${index}:`);
      console.log(`      Line: ${step.line}, Code: "${step.code}"`);
      console.log(`      Async Operation: ${step.asyncOperation.type}`);
      console.log(
        `      Scheduled at: line ${step.asyncOperation.scheduledAt.line}`,
      );
    });
    return this.asyncSteps;
  }

  /**
   * Скидає стан
   */
  reset(): void {
    this.asyncSteps = [];
    this.stepCounter = 0;
    this.processingQueue = Promise.resolve();
    this.asyncOperations.clear();
    this.asyncLinesMap.clear();
  }

  /**
   * Встановлює початковий лічильник кроків
   * (щоб async steps продовжували нумерацію після sync steps)
   */
  setInitialStepCounter(count: number): void {
    this.stepCounter = count;
  }

  /**
   * Додає async step вручну (без debugger pause)
   * Використовується для Promise callbacks які debugger не може спіймати
   */
  addAsyncStep(step: AsyncExecutionStep): void {
    this.asyncSteps.push(step);
    this.stepCounter++;
    console.log(`✅ [ASYNC] Step ${step.step} added manually`);
  }
}
