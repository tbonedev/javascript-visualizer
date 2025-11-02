import { Injectable } from '@nestjs/common';
import { V8InspectorService } from '../../../../v8-inspector/v8-inspector.service';
import { CircularGuard, PropertyFilter } from '../helpers';

/**
 * Сериализует объекты из V8 RemoteObject
 */
@Injectable()
export class ObjectSerializer {
  constructor(
    private readonly v8Inspector: V8InspectorService,
    private readonly circularGuard: CircularGuard,
    private readonly propertyFilter: PropertyFilter,
  ) {}

  /**
   * Извлекает свойства объекта
   */
  async serialize(
    objectId: string,
    extractValueFn: (value: any) => Promise<unknown>,
  ): Promise<Record<string, unknown>> {
    // Проверка на превышение максимальной глубины
    if (this.circularGuard.isMaxDepthReached()) {
      return { '[Object]': '...' };
    }

    // Входим в объект
    this.circularGuard.enterObject();

    const obj: Record<string, unknown> = {};

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
          // Type guard для свойств
          if (
            typeof prop === 'object' &&
            prop !== null &&
            'name' in prop &&
            typeof prop.name === 'string'
          ) {
            // Пропускаем ненужные свойства
            if (this.propertyFilter.shouldSkipByName(prop.name)) {
              continue;
            }

            // Пропускаем геттеры и сеттеры
            if (this.propertyFilter.shouldSkipAccessor(prop)) {
              continue;
            }

            // Пропускаем числовые индексы (для массивов)
            if (this.propertyFilter.isArrayIndex(prop.name)) {
              continue;
            }

            // Извлекаем значение
            if ('value' in prop) {
              const value = await extractValueFn(prop.value);
              obj[prop.name] = value;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error extracting object:', error);
    }

    // Выходим из объекта
    this.circularGuard.exitObject();

    return obj;
  }
}
