import inspector from 'inspector';
import { Scope } from '../../../interfaces';

export interface IScopeExtractorService {
  /**
   * Extracts whole scope from current call frame
   */

  extractScope(frame: inspector.Debugger.CallFrame): Promise<Scope>;

  /**
   * Extracts local variables
   */
  extractLocalVariables(
    frame: inspector.Debugger.CallFrame,
  ): Promise<Record<string, unknown>>;

  /**
   * Extracts closure variables
   */
  extractClosureVariables(
    frame: inspector.Debugger.CallFrame,
  ): Promise<Record<string, unknown>>;

  /**
   * Extracts global variables
   */
  extractGlobalVariables(
    frame: inspector.Debugger.CallFrame,
  ): Promise<Record<string, unknown>>;
}
