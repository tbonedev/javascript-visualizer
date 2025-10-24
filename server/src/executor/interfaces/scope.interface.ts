export interface Scope {
  local: Record<string, unknown>;
  closure: Record<string, unknown>;
  global: Record<string, unknown>;
}
