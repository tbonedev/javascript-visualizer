import { Injectable } from '@nestjs/common';
import inspector from 'inspector';
import { Scope } from '../../interfaces';
import { IScopeExtractorService } from './interfaces';
import { VariableSerializerService } from './variable-serializer';
import { UserFunctionParserService } from './user-function-parser.service';

@Injectable()
export class ScopeExtractorService implements IScopeExtractorService {
  private debugCounter = 0;
  private readonly MAX_DEBUG_CALLS = 3; // Ограничение для безопасности

  constructor(
    private readonly variableSerializer: VariableSerializerService,
    private readonly userFunctionParser: UserFunctionParserService,
  ) {}

  /**
   * Извлекает полный scope из текущего call frame
   */
  async extractScope(frame: inspector.Debugger.CallFrame): Promise<Scope> {
    return {
      local: await this.extractLocalVariables(frame),
      closure: await this.extractClosureVariables(frame),
      global: this.extractGlobalVariables(),
    };
  }
  /**
   * Извлекает локальные переменные из текущего фрейма
   */
  async extractLocalVariables(
    frame: inspector.Debugger.CallFrame,
  ): Promise<Record<string, unknown>> {
    const locals: Record<string, unknown> = {};

    // Проверяем script scope (глобальные переменные пользователя)
    const scriptScope = frame.scopeChain.find((s) => s.type === 'script');
    if (scriptScope && scriptScope.object.objectId) {
      const properties = await this.variableSerializer.getProperties(
        scriptScope.object.objectId,
      );
      properties.forEach((prop) => {
        locals[prop.name] = prop.value;
      });
    }

    // Проверяем local scope (параметры и локальные переменные функции)
    const localScope = frame.scopeChain.find((s) => s.type === 'local');
    if (localScope && localScope.object.objectId) {
      const properties = await this.variableSerializer.getProperties(
        localScope.object.objectId,
      );
      properties.forEach((prop) => {
        locals[prop.name] = prop.value;
      });
    }

    // Проверяем block scope (переменные в циклах, if, и т.д.) - последними для приоритета
    const blockScopes = frame.scopeChain.filter((s) => s.type === 'block');
    for (const blockScope of blockScopes) {
      if (blockScope.object.objectId) {
        const properties = await this.variableSerializer.getProperties(
          blockScope.object.objectId,
        );
        properties.forEach((prop) => {
          locals[prop.name] = prop.value;
        });
      }
    }

    // Если всё ещё пусто, добавляем пользовательские функции
    if (Object.keys(locals).length === 0) {
      const userFunctions = this.userFunctionParser.getFunctionsForScope();
      Object.assign(locals, userFunctions);
    }

    return locals;
  }

  /**
   * Извлекает переменные из замыканий (closure)
   */
  async extractClosureVariables(
    frame: inspector.Debugger.CallFrame,
  ): Promise<Record<string, unknown>> {
    const closureVars: Record<string, unknown> = {};

    // Найти все closure scopes (может быть несколько!)
    const closureScopes = frame.scopeChain.filter((s) => s.type === 'closure');

    for (const scope of closureScopes) {
      if (scope.object.objectId) {
        const properties = await this.variableSerializer.getProperties(
          scope.object.objectId,
        );
        properties.forEach((prop) => {
          // Добавляем только если еще не добавлено (ближайшее замыкание имеет приоритет)
          if (!(prop.name in closureVars)) {
            closureVars[prop.name] = prop.value;
          }
        });
      }
    }

    return closureVars;
  }

  /**
   * Извлекает глобальные переменные
   * Пока возвращает пустой объект (глобальные переменные обычно не нужны)
   */
  extractGlobalVariables(): Record<string, unknown> {
    const globals: Record<string, unknown> = {};
    // Глобальные переменные обычно не нужны в визуализации
    return globals;
  }
}
