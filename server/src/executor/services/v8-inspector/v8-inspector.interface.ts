import inspector from 'inspector';

/**
 * Event handler for V8 Inspector events
 */
export type V8EventHandler<T = unknown> = (message: {
  method: string;
  params: T;
}) => void;

/**
 * Interface for working with V8 Inspector
 */
export interface IV8InspectorService {
  connect(): Promise<void>;

  disconnect(): void;
  /**
   * Call V8 Inspector API method
   */
  post(method: string, params?: Record<string, unknown>): Promise<unknown>;
  /**
   * Subscribe to V8 Inspector event
   */
  on<T = unknown>(event: string, handler: V8EventHandler<T>): void;
  /**
   * Get inspector session
   */
  getSession(): inspector.Session | null;
}
