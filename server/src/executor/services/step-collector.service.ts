import { Injectable } from '@nestjs/common';
import inspector from 'inspector';
import { ExecutionStep, IStepCollectorService } from '../interfaces';
import { V8InspectorService } from './v8-inspector.service';

@Injectable()
export class StepCollectorService implements IStepCollectorService {
  private steps: ExecutionStep[] = [];
  private stepCounter: number = 0;
  private visitedLines: Set<number> = new Set();

  constructor(private readonly v8Inspector: V8InspectorService) {}

  async handlePause(
    params: inspector.Debugger.PausedEventDataType,
    codeLines: string[],
  ): Promise<void> {
    if (!params.callFrames || params.callFrames.length === 0) {
      await this.v8Inspector.post('Debugger.resume');
      return;
    }
    const currentFrame = params.callFrames[0];
    const location = currentFrame.location;
    const lineNumber = location.lineNumber;

    if (lineNumber < 0 || lineNumber >= codeLines.length) {
      await this.v8Inspector.post('Debugger.resume');
      return;
    }
    const codeLine = codeLines[lineNumber] || '';

    if (codeLine.trim().length === 0) {
      await this.v8Inspector.post('Debugger.resume');
      return;
    }

    if (this.visitedLines.has(lineNumber)) {
      await this.v8Inspector.post('Debugger.resume');
      return;
    }

    this.visitedLines.add(lineNumber);
    console.log(`⏸️  Paused at line: ${lineNumber}`);

    const step: ExecutionStep = {
      step: this.stepCounter++,
      line: lineNumber,
      code: codeLine.trim(),
      variables: {},
    };

    this.steps.push(step);
    await this.v8Inspector.post('Debugger.resume');
  }
  getSteps(): ExecutionStep[] {
    return this.steps;
  }

  reset(): void {
    this.steps = [];
    this.stepCounter = 0;
    this.visitedLines.clear();
  }
}
