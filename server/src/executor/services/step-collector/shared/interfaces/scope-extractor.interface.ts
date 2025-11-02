import inspector from 'inspector';
import { Scope } from '../scope.interface';

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
    isInsideFunction: boolean,
  ): Promise<Record<string, unknown>>;

  /**
   * Extracts closure variables
   */
  extractClosureVariables(
    frame: inspector.Debugger.CallFrame,
    isInsideFunction: boolean,
  ): Promise<Record<string, unknown>>;

  /**
   * Extracts global variables
   */
  extractGlobalVariables(
    frame: inspector.Debugger.CallFrame,
    isInsideFunction: boolean,
  ): Promise<Record<string, unknown>>;
}
