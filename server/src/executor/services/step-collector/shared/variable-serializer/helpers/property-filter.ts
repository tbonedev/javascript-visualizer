/**
 * Filter for object properties during serialization для свойств
 * Determines, which properties to skip
 */

export class PropertyFilter {
  shouldSkipByName(propName: string): boolean {
    return (
      propName.startsWith('[[') ||
      propName.startsWith('__') ||
      /^\d+$/.test(propName) ||
      propName === 'constructor' ||
      propName === 'prototype'
    );
  }

  isGetter(prop: any): boolean {
    return typeof prop === 'object' && prop !== null && 'get' in prop;
  }

  isSetter(prop: any): boolean {
    return typeof prop === 'object' && prop !== null && 'set' in prop;
  }

  shouldSkipAccessor(prop: any): boolean {
    return this.isGetter(prop) || this.isSetter(prop);
  }

  shouldSkip(prop: any): boolean {
    if (typeof prop !== 'object' || prop === null) {
      return false;
    }
    if (!('name' in prop) || typeof prop.name !== 'string') {
      return true;
    }

    return this.shouldSkipByName(prop.name) || this.shouldSkipAccessor(prop);
  }

  isArrayIndex(propName: string): boolean {
    return /^\d+$/.test(propName);
  }
}
