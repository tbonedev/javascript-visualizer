import { Injectable } from '@nestjs/common';
import { IBreakpointService } from '../interfaces';
import { V8InspectorService } from './v8-inspector.service';

@Injectable()
export class BreakpointService implements IBreakpointService {
  private readonly VIRTUAL_URL = 'virtual://code.js';

  constructor(private readonly V8Inspector: V8InspectorService) {}

  async setBreakpoints(code: string): Promise<void> {
    // Активируем breakpoints
    await this.V8Inspector.post('Debugger.setBreakpointsActive', {
      active: true,
    });

    const lines = code.split('\n');
    let breakpointCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.length === 0 || line.startsWith('//')) {
        continue;
      }

      await this.V8Inspector.post('Debugger.setBreakpointByUrl', {
        lineNumber: i,
        url: this.VIRTUAL_URL,
        columnNumber: 0,
      });
      breakpointCount++;
    }
    console.log(
      `✅ Set ${breakpointCount} breakpoints for ${lines.length} lines`,
    );
  }

  async setBreakpointsByScriptId(
    scriptId: string,
    code: string,
  ): Promise<void> {
    const lines = code.split('\n');
    let breakpointCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.length === 0 || line.startsWith('//')) {
        continue;
      }

      await this.V8Inspector.post('Debugger.setBreakpoint', {
        location: {
          scriptId,
          lineNumber: i,
          columnNumber: 0,
        },
      });
      breakpointCount++;
    }
    console.log(
      `✅ Set ${breakpointCount} breakpoints for script ${scriptId}`,
    );
  }
}
