import { Injectable } from '@nestjs/common';
import inspector from 'inspector';
import { ExecutionStep } from './interfaces/execution-step.interface';
import { IStepCollectorService } from './interfaces/step-collector.interface';
import { V8InspectorService } from '../../v8-inspector/v8-inspector.service';
import { ScopeExtractorService } from '../shared/scope-extractor.service';
import { VariableSerializerService } from '../shared/variable-serializer';
import { StackFrame } from '../shared/interfaces/stack-frame.interface';
import { EventLoopTrackerService } from '../../event-loop-tracker/event-loop-tracker.service';
@Injectable()
export class StepCollectorService implements IStepCollectorService {
  private steps: ExecutionStep[] = [];
  private stepCounter: number = 0;
  private processingQueue: Promise<void> = Promise.resolve(); // Очередь для последовательной обработки

  private readonly MAX_STEPS = 1001;
  constructor(
    private readonly v8Inspector: V8InspectorService,
    private readonly scopeExtractor: ScopeExtractorService,
    private readonly variableSerializer: VariableSerializerService,
    private readonly eventLoopTracker: EventLoopTrackerService,
  ) {}

  /**
   * Обрабатывает паузу выполнения и собирает данные о текущем шаге
   * Добавляет обработку в очередь для последовательного выполнения
   */
  async handlePause(
    params: inspector.Debugger.PausedEventDataType,
    codeLines: string[],
  ): Promise<void> {
    // Добавляем в очередь - обрабатываем последовательно!
    this.processingQueue = this.processingQueue.then(() =>
      this.processPause(params, codeLines),
    );

    return this.processingQueue;
  }

  /**
   * Внутренний метод для обработки паузы
   */
  private async processPause(
    params: inspector.Debugger.PausedEventDataType,
    codeLines: string[],
  ): Promise<void> {
    // DEBUG: Log async stack trace info
    // console.log('🔍 Pause event:', {
    //   reason: params.reason,
    //   hasAsyncStackTrace: !!params.asyncStackTrace,
    //   asyncStackTraceId: params.asyncStackTraceId,
    // });

    // if (params.asyncStackTrace) {
    //   console.log('📚 Async Stack Trace:', JSON.stringify(params.asyncStackTrace, null, 2));
    // }

    // Проверка наличия call frames
    if (!params.callFrames || params.callFrames.length === 0) {
      try {
        await this.v8Inspector.post('Debugger.stepOver');
      } catch (error) {
        if (error.code !== 'ERR_INSPECTOR_COMMAND') throw error;
      }
      return;
    }

    // 🎯 HYBRID MODE: Skip async callbacks (microtasks, timeouts)
    // Async callbacks have fewer call frames (usually < 4)
    const isInsideAsyncCallback = params.callFrames.length < 4;
    if (isInsideAsyncCallback) {
      console.log('⏭️  Inside async callback, skipping (Hybrid mode)');
      try {
        // Resume execution - we don't step through callbacks
        await this.v8Inspector.post('Debugger.resume');
      } catch (error) {
        if (error.code !== 'ERR_INSPECTOR_COMMAND') throw error;
      }
      return;
    }

    const currentFrame = params.callFrames[0];
    const location = currentFrame.location;
    const lineNumber = location.lineNumber;

    // Проверка валидности номера строки
    if (lineNumber < 0 || lineNumber >= codeLines.length) {
      try {
        await this.v8Inspector.post('Debugger.stepOver');
      } catch (error) {
        if (error.code !== 'ERR_INSPECTOR_COMMAND') throw error;
      }
      return;
    }

    const codeLine = codeLines[lineNumber] || '';

    // Пропускаем пустые строки
    if (codeLine.trim().length === 0) {
      try {
        await this.v8Inspector.post('Debugger.stepOver');
      } catch (error) {
        if (error.code !== 'ERR_INSPECTOR_COMMAND') throw error;
      }
      return;
    }

    console.log(`⏸️  Paused at line ${lineNumber}: "${codeLine.trim()}"`);
    console.log(`    Reason: ${params.reason}`);
    console.log(`    Call frames count: ${params.callFrames.length}`);

    if (this.stepCounter >= this.MAX_STEPS) {
      console.warn(`⚠️  Reached maximum steps limit: ${this.MAX_STEPS}`);
      try {
        await this.v8Inspector.post('Debugger.stepOver');
      } catch (error) {
        if (error.code !== 'ERR_INSPECTOR_COMMAND') throw error;
      }
      return;
    }

    // Извлекаем scope через ScopeExtractor
    const scope = await this.scopeExtractor.extractScope(currentFrame);

    // Создаем шаг выполнения
    const step: ExecutionStep = {
      step: this.stepCounter++,
      line: lineNumber,
      code: codeLine.trim(),
      scope,
      callStack: this.buildCallStack(params.callFrames),
      eventLoop: this.eventLoopTracker.getEventLoopState(),
    };

    this.steps.push(step);
    try {
      // Используем stepOver вместо resume для пошагового выполнения
      await this.v8Inspector.post('Debugger.stepOver');
    } catch (error) {
      if (error.code !== 'ERR_INSPECTOR_COMMAND') throw error;
    }
  }

  private buildCallStack(
    callFrames: inspector.Debugger.CallFrame[],
  ): StackFrame[] {
    if (callFrames.length === 0) return [];

    // Находим максимальный scriptId (это пользовательский код)
    const userScriptId = Math.max(
      ...callFrames.map((f) => parseInt(f.location.scriptId, 10)),
    ).toString();

    // Фильтруем только фреймы из пользовательского кода
    return callFrames
      .filter((frame) => frame.location.scriptId === userScriptId)
      .map((frame) => ({
        functionName: frame.functionName || '(anonymous)',
        line: frame.location.lineNumber,
        column: frame.location.columnNumber || 0,
      }));
  }
  /**
   * Возвращает собранные шаги выполнения
   */
  getSteps(): ExecutionStep[] {
    console.log('📊 Final steps count:', this.steps.length);
    this.steps.forEach((step, index) => {
      console.log(`   Step ${index}:`);
      console.log(`      Line: ${step.line}, Code: "${step.code}"`);
      console.log(`      Global vars:`, Object.keys(step.scope.global));
      console.log(`      Local vars:`, Object.keys(step.scope.local));
      console.log(`      Closure vars:`, Object.keys(step.scope.closure));
    });
    return this.steps;
  }

  /**
   * Сбрасывает состояние коллектора
   */
  reset(): void {
    this.steps = [];
    this.stepCounter = 0;
    this.processingQueue = Promise.resolve(); // Сбрасываем очередь
    this.variableSerializer.reset(); // ← Сбрасываем circular guard!
    this.eventLoopTracker.reset();
  }
}
