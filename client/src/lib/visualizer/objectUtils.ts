import { ObjectType, ValueType, ZoneType } from './types';

const objectIdMap = new WeakMap<object, string>();
let objectIdCounter = 0;

export function resetObjectIds(): void {
  objectIdCounter = 0;
}

export function generateObjectId(obj: object): string {
  if (objectIdMap.has(obj)) {
    return objectIdMap.get(obj)!;
  }
  const id = `@${++objectIdCounter}`;
  objectIdMap.set(obj, id);
  return id;
}

export function isPrimitive(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  const type = typeof value;

  return type === 'number' || type === 'string' || type === 'boolean';
}

export function isReferenceType(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  const type = typeof value;

  return type === 'object' || type === 'function';
}

export function getValueType(value: unknown): ValueType {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  const type = typeof value;

  if (type === 'number') return 'number';
  if (type === 'string') return 'string';
  if (type === 'boolean') return 'boolean';
  if (type === 'function') return 'function';

  if (Array.isArray(value)) return 'array';

  return 'object';
}

export function getObjectType(value: unknown): ObjectType {
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'function') return 'function';
  return 'object';
}

export function getObjectZone(type: ObjectType): ZoneType {
  if (type === 'array') return 'data-structures';
  if (type === 'function') return 'functions';
  return 'objects';
}

export function formatPrimitiveValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  const type = typeof value;

  if (type === 'string') return `"${value}"`;
  if (type === 'number') {
    // Специальные числовые значения
    if (Number.isNaN(value as number)) return 'NaN';
    if (value === Infinity) return 'Infinity';
    if (value === -Infinity) return '-Infinity';
    return String(value);
  }

  return String(value);
}
