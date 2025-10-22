import { Injectable } from '@nestjs/common';
import inspector from 'inspector';
import { IV8InspectorService, V8EventHandler } from '../interfaces';

/**
 * Service for working with V8 Inspector Protocol
 */
@Injectable()
export class V8InspectorService implements IV8InspectorService {
  private session: inspector.Session | null = null;

  /**
   * Connect to V8 Inspector
   */
  async connect(): Promise<void> {
    this.session = new inspector.Session();
    this.session.connect();

    await this.post('Debugger.enable');
    await this.post('Runtime.enable');

    console.log('✅ V8 Inspector connected');
  }

  /**
   * Disconnect from V8 Inspector
   */
  disconnect(): void {
    if (this.session) {
      this.session.disconnect();
      this.session = null;
      console.log('✅ V8 Inspector disconnected');
    }
  }

  /**
   * Call V8 Inspector API method
   */
  post(method: string, params?: Record<string, unknown>): Promise<unknown> {
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

  /**
   * Subscribe to V8 Inspector event
   */
  on<T>(event: string, handler: V8EventHandler<T>): void {
    if (!this.session) {
      throw new Error('Inspector session not initialized');
    }

    this.session.on(event, handler);
  }

  /**
   * Get inspector session
   */
  getSession(): inspector.Session | null {
    return this.session;
  }
}