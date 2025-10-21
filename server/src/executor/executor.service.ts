import { Injectable } from '@nestjs/common';
import inspector from 'inspector';
import { ExecutionStep } from './interfaces/execution-step.interface';
import vm from 'vm';

@Injectable()
export class ExecutorService {
  private session: inspector.Session | null = null;
  private steps: ExecutionStep[] = [];
  private stepCounter: number = 0;
  private codeLines: string[] = [];
  private visitedLines: Set<number> = new Set();

  async execute(code: string): Promise<ExecutionStep[]> {
    this.steps = [];
    this.stepCounter = 0;
    this.codeLines = code.split('\n');
    this.visitedLines = new Set();

    try {
      await this.setupV8();
      await this.setBreakpoints(code);
      await this.runCode(code);

      return this.steps;
    } finally {
      this.cleanUp();
    }
  }

  private post(method: string, params?: object): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.session) {
        reject(new Error('Inspector session not initialized'));
        return;
      }
      this.session.post(method, params, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  private cleanUp(): void {
    if (this.session) {
      this.session.disconnect();
      this.session = null;
      console.log('✅ V8 Inspector disconnected');
    }
    this.steps = [];
    this.stepCounter = 0;
    this.codeLines = [];
    this.visitedLines.clear();
  }

  private async setupV8(): Promise<void> {
    this.session = new inspector.Session();
    this.session.connect();

    await this.post('Debugger.enable');
    await this.post('Runtime.enable');

    console.log('✅ V8 Inspector connected');
  }

  private async setBreakpoints(code: string): Promise<void> {
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.length === 0 || line.startsWith('//')) {
        continue;
      }

      await this.post('Debugger.setBreakpointByUrl', {
        lineNumber: i,
        url: 'virtual://code.js',
        columnNumber: 0,
      });
    }

    console.log(`✅ Set breakpoints for ${lines.length} lines`);
  }

  private async runCode(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Execution timeout (5 seconds)'));
      }, 5000);

      this.session!.on('Debugger.paused', (message) => {
        const params = message.params;

        this.handlePause(params).catch((error) => {
          clearTimeout(timeout);
          reject(error instanceof Error ? error : new Error(String(error)));
        });
      });

      this.session!.on('Runtime.executionContextDestroyed', () => {
        clearTimeout(timeout);
        console.log('✅ Code execution completed');
        resolve();
      });

      const context = vm.createContext({
        console: console,
        Math: Math,
      });

      const script = new vm.Script(code, {
        filename: 'virtual://code.js',
      });

      try {
        script.runInContext(context, {
          timeout: 10000,
        });
        console.log('✅ Code execution started');
      } catch (error) {
        clearTimeout(timeout);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private async handlePause(
    params: inspector.Debugger.PausedEventDataType,
  ): Promise<void> {
    if (!params.callFrames || params.callFrames.length === 0) {
      await this.post('Debugger.resume');
      return;
    }

    const currentFrame = params.callFrames[0];
    const location = currentFrame.location;
    const lineNumber = location.lineNumber;

    if (lineNumber < 0 || lineNumber >= this.codeLines.length) {
      await this.post('Debugger.resume');
      return;
    }

    const codeLine = this.codeLines[lineNumber] || '';

    if (codeLine.trim().length === 0) {
      await this.post('Debugger.resume');
      return;
    }

    if (this.visitedLines.has(lineNumber)) {
      await this.post('Debugger.resume');
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
    console.log(`📝 Saved step #${step.step}: line ${lineNumber}`);

    await this.post('Debugger.resume');
  }
}
