import { Injectable } from '@nestjs/common';
import { AsyncEvent } from '../../../interfaces/async-event.interface';

/**
 * Stores async events for debugging and analysis
 */
@Injectable()
export class EventStore {
  private events: AsyncEvent[] = [];

  add(event: AsyncEvent): void {
    this.events.push(event);
  }

  getAll(): AsyncEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}
