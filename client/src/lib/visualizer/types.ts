// Types from backend (mirrored to avoid import issues)
export interface ExecutionStep {
  step: number;
  line: number;
  code: string;
  scope: Scope;
  callStack?: StackFrame[];
}

export interface Scope {
  local: Record<string, unknown>;
  closure: Record<string, unknown>;
  global: Record<string, unknown>;
}

export interface StackFrame {
  functionName: string;
  line: number;
  column: number;
}

// Visualizer-specific types
export interface ParsedVariable {
  name: string;
  value: unknown;
  isPrimitive: boolean;
  objectId?: string;
  type: ValueType;
}

export interface ParsedFrame {
  type: 'global' | 'closure' | 'local';
  functionName?: string;
  variables: ParsedVariable[];
}

export interface ParsedObject {
  id: string;
  type: ObjectType;
  data: unknown;
  zone: ZoneType;
}
export type ValueType =
  | 'number'
  | 'string'
  | 'boolean'
  | 'null'
  | 'undefined'
  | 'array'
  | 'object'
  | 'function';

export type ObjectType = 'array' | 'object' | 'function';

export type ZoneType = 'data-structures' | 'objects' | 'functions';

export interface VisualizationData {
  frames: ParsedFrame[];
  objects: ParsedObject[];
}