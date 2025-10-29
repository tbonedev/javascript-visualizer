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

    console.log('🔧 Setting breakpoints:');
    console.log('📄 Total lines:', lines.length);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      console.log(`  Line ${i}: "${lines[i]}" (trimmed: "${line}")`);

      if (line.length === 0 || line.startsWith('//')) {
        console.log(`    ⏭️  Skipped (empty or comment)`);
        continue;
      }

      try {
        const result = await this.V8Inspector.post('Debugger.setBreakpointByUrl', {
          lineNumber: i,
          url: this.VIRTUAL_URL,
          columnNumber: 0,
        });
        console.log(`    ✅ Breakpoint set successfully`, result);
        breakpointCount++;
      } catch (error) {
        console.log(`    ❌ Failed to set breakpoint:`, error);
      }
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

    console.log('🔧 Setting breakpoints by scriptId:', scriptId);
    console.log('📄 Total lines:', lines.length);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      console.log(`  Line ${i}: "${lines[i]}" (trimmed: "${line}")`);

      if (line.length === 0 || line.startsWith('//')) {
        console.log(`    ⏭️  Skipped (empty or comment)`);
        continue;
      }

      try {
        const result = await this.V8Inspector.post('Debugger.setBreakpoint', {
          location: {
            scriptId,
            lineNumber: i,
            columnNumber: 0,
          },
        });
        console.log(`    ✅ Breakpoint set at line ${i}:`, result);
        breakpointCount++;
      } catch (error) {
        console.log(`    ❌ Failed to set breakpoint at line ${i}:`, error);
      }
    }

    console.log(`✅ Set ${breakpointCount} breakpoints for script ${scriptId}`);
  }
}
