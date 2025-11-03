export interface BreakpointInfo {
  lineNumber: number;
  breakpointId?: string;
  isActive: boolean;
}

export interface IBreakpointService {
  setBreakpoints(code: string): Promise<void>;
  setBreakpointsByScriptId(scriptId: string, code: string): Promise<void>;
}
