import { Injectable } from '@nestjs/common';
import inspector from 'inspector';

/**
 * Serialize primitive data-types and delegates и non-primitive
 */
@Injectable()
export class ValueSerializer {
  async serialize(
    remoteObject: inspector.Runtime.RemoteObject,
  ): Promise<{ type: string; value?: unknown; objectId?: string }> {
    if (!remoteObject) {
      return { type: 'undefined', value: undefined };
    }

    if (remoteObject.type === 'undefined') {
      return { type: 'undefined', value: undefined };
    }

    if (remoteObject.type === 'string') {
      return { type: 'string', value: remoteObject.value };
    }

    if (remoteObject.type === 'number') {
      return { type: 'number', value: remoteObject.value };
    }

    if (remoteObject.type === 'boolean') {
      return { type: 'boolean', value: remoteObject.value };
    }

    if (remoteObject.subtype === 'null') {
      return { type: 'null', value: null };
    }

    if (remoteObject.subtype === 'array' && remoteObject.objectId) {
      return {
        type: 'array',
        objectId: remoteObject.objectId,
      };
    }

    if (remoteObject.type === 'object' && remoteObject.objectId) {
      return {
        type: 'object',
        objectId: remoteObject.objectId,
      };
    }

    if (remoteObject.type === 'function') {
      return {
        type: 'function',
        value: `[Function: ${remoteObject.description || 'anonymous'}]`,
      };
    }

    // Fallback
    return {
      type: 'unknown',
      value: remoteObject.description || remoteObject.value,
    };
  }
}
