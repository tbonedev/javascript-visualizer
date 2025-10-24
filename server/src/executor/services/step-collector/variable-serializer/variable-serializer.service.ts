import { Injectable } from '@nestjs/common';
import inspector from 'inspector';
import { IVariableSerializerService } from '../interfaces';
import { V8InspectorService } from '../../v8-inspector.service';
import { CircularGuard, PropertyFilter } from './helpers';
import {
  ValueSerializer,
  ArraySerializer,
  ObjectSerializer,
} from './serializers';

@Injectable()
export class VariableSerializerService implements IVariableSerializerService {
  constructor(
    private readonly v8Inspector: V8InspectorService,
    private readonly circularGuard: CircularGuard,
    private readonly propertyFilter: PropertyFilter,
    private readonly valueSerializer: ValueSerializer,
    private readonly arraySerializer: ArraySerializer,
    private readonly objectSerializer: ObjectSerializer,
  ) {}
  /**
   * Serialize RemoteObject in to JavaScript value
   */
  async serialize(
    remoteObject: inspector.Runtime.RemoteObject,
  ): Promise<unknown> {
    const result = await this.valueSerializer.serialize(remoteObject);

    if (result.type !== 'array' && result.type !== 'object') {
      return result.value;
    }

    if (result.type === 'array' && result.objectId) {
      return await this.arraySerializer.serialize(
        result.objectId,
        this.serialize.bind(this),
      );
    }

    if (result.type === 'object' && result.objectId) {
      return await this.objectSerializer.serialize(
        result.objectId,
        this.serialize.bind(this),
      );
    }

    return result.value;
  }

  async getProperties(
    objectId: string,
  ): Promise<Array<{ name: string; value: unknown }>> {
    const properties: Array<{ name: string; value: unknown }> = [];

    try {
      const response = await this.v8Inspector.post('Runtime.getProperties', {
        objectId: objectId,
        ownProperties: true,
      });

      if (
        response &&
        typeof response === 'object' &&
        'result' in response &&
        Array.isArray(response.result)
      ) {
        for (const prop of response.result) {
          if (
            typeof prop === 'object' &&
            prop !== null &&
            'name' in prop &&
            typeof prop.name === 'string'
          ) {
            if (this.propertyFilter.shouldSkip(prop)) {
              continue;
            }
          }
          if ('value' in prop) {
            const value = await this.serialize(
              prop.value as inspector.Runtime.RemoteObject,
            );
            properties.push({
              name: prop.name,
              value: value,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error getting object properties:', error);
    }
    return properties;
  }

  reset(): void {
    this.circularGuard.reset();
  }
}
