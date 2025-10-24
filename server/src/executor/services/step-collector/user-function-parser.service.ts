import { Injectable } from '@nestjs/common';

/**
 * Парсит пользовательский код для извлечения объявлений функций
 */
@Injectable()
export class UserFunctionParserService {
  private userFunctions: Map<string, string> = new Map();

  /**
   * Парсит код и находит все function declarations
   */
  parseCode(code: string): void {
    this.userFunctions.clear();

    // Regex для function declarations
    // Поддерживает: function name(...) { ... }
    const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
    let match;

    while ((match = functionRegex.exec(code)) !== null) {
      const functionName = match[1];
      this.userFunctions.set(functionName, 'function');
    }

    // Также поддерживаем arrow functions с const/let/var
    // const/let/var name = (...) => ...
    const arrowFunctionRegex =
      /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;

    while ((match = arrowFunctionRegex.exec(code)) !== null) {
      const functionName = match[1];
      this.userFunctions.set(functionName, 'arrow function');
    }
  }

  /**
   * Возвращает Map с пользовательскими функциями
   */
  getUserFunctions(): Map<string, string> {
    return this.userFunctions;
  }

  /**
   * Возвращает объект с функциями для добавления в scope
   */
  getFunctionsForScope(): Record<string, string> {
    const result: Record<string, string> = {};

    this.userFunctions.forEach((type, name) => {
      result[name] = `[Function: ${name}]`;
    });

    return result;
  }

  /**
   * Сбрасывает состояние парсера
   */
  reset(): void {
    this.userFunctions.clear();
  }
}
