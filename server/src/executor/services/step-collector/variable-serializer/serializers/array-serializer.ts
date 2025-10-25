import { Injectable } from '@nestjs/common';
import { V8InspectorService } from '../../../v8-inspector.service';
import { CircularGuard, PropertyFilter } from '../helpers';

@Injectable()
export class ArraySerializer {
  constructor(
    private readonly v8Inspector: V8InspectorService,
    private readonly circularGuard: CircularGuard,
    private readonly propertyFilter: PropertyFilter,
  ) {}

  /**
   * Extracts elements from array
   */
  async serialize(
    objectId: string,
    extractValueFn: (value: any) => Promise<unknown>,
  ): Promise<unknown[]> {
    // Проверка на превышение максимальной глубины
    if (this.circularGuard.isMaxDepthReached()) {
      return ['[Array]', '...'];
    }

    // Входим в массив
    this.circularGuard.enterObject();

    const arr: unknown[] = [];

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
        // Фильтруем только числовые индексы и сортируем
        const elements = response.result
          .filter((prop: any) => {
            return (
              typeof prop === 'object' &&
              prop !== null &&
              'name' in prop &&
              typeof prop.name === 'string' &&
              this.propertyFilter.isArrayIndex(prop.name)
            );
          })
          .sort((a: any, b: any) => parseInt(a.name) - parseInt(b.name));

        for (const element of elements) {
          if (
            typeof element === 'object' &&
            element !== null &&
            'value' in element
          ) {
            const value = await extractValueFn(element.value);
            arr.push(value);
          }
        }
      }
    } catch (error) {
      console.error('Error extracting array:', error);
    }

    // Выходим из массива
    this.circularGuard.exitObject();

    return arr;
  }
}
