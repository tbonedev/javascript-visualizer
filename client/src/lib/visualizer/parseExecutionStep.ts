import {
  ExecutionStep,
  ParsedVariable,
  ParsedFrame,
  ParsedObject,
  VisualizationData,
} from './types';
import {
  resetObjectIds,
  generateObjectId,
  isPrimitive,
  isReferenceType,
  getValueType,
  getObjectType,
  getObjectZone,
} from './objectUtils';

function parseVariables(scopeObj: Record<string, unknown>): ParsedVariable[] {
  const variables: ParsedVariable[] = [];

  for (const [name, value] of Object.entries(scopeObj)) {
    const valueType = getValueType(value);
    const isPrim = isPrimitive(value);

    const variable: ParsedVariable = {
      name,
      value,
      isPrimitive: isPrim,
      type: valueType,
    };

    if (!isPrim && isReferenceType(value)) {
      variable.objectId = generateObjectId(value as object);
    }
    variables.push(variable);
  }
  return variables;
}

function extractObjects(scopeObj: Record<string, unknown>): ParsedObject[] {
  const objects: ParsedObject[] = [];

  for (const value of Object.values(scopeObj)) {
    if (isReferenceType(value)) {
      const id = generateObjectId(value as object);
      const objectType = getObjectType(value);
      const zone = getObjectZone(objectType);

      objects.push({
        id,
        type: objectType,
        data: value,
        zone,
      });
    }
  }
  return objects;
}

export function parseExecutionStep(step: ExecutionStep): VisualizationData {
  // Сбрасываем счетчик ID для нового шага
  resetObjectIds();

  const frames: ParsedFrame[] = [];
  const allObjects: ParsedObject[] = [];

  // ЛОГА для отладки
  console.log('🔧 Parsing step:', step.step);
  console.log('  - Global keys:', Object.keys(step.scope.global));
  console.log('  - Local keys:', Object.keys(step.scope.local));
  console.log('  - Closure keys:', Object.keys(step.scope.closure));

  // Парсим Global frame
  if (Object.keys(step.scope.global).length > 0) {
    const variables = parseVariables(step.scope.global);
    console.log('  ✅ Global variables parsed:', variables);

    frames.push({
      type: 'global',
      variables,
    });

    allObjects.push(...extractObjects(step.scope.global));
  }
  // Парсим Closure frame (если есть)
  if (Object.keys(step.scope.closure).length > 0) {
    // Определяем имя функции из callStack если есть
    const functionName =
      step.callStack && step.callStack.length > 1
        ? step.callStack[step.callStack.length - 2].functionName
        : 'outer';

    frames.push({
      type: 'closure',
      functionName,
      variables: parseVariables(step.scope.closure),
    });

    allObjects.push(...extractObjects(step.scope.closure));
  }

  // Парсим Local frame (если есть)
  if (Object.keys(step.scope.local).length > 0) {
    // Определяем имя функции из callStack
    const functionName =
      step.callStack && step.callStack.length > 0
        ? step.callStack[step.callStack.length - 1].functionName
        : undefined;

    frames.push({
      type: 'local',
      functionName,
      variables: parseVariables(step.scope.local),
    });

    allObjects.push(...extractObjects(step.scope.local));
  }

  const uniqueObjects = Array.from(
    new Map(allObjects.map((obj) => [obj.id, obj])).values()
  );

  return {
    frames,
    objects: uniqueObjects,
  };
}
