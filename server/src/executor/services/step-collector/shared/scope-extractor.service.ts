import { Injectable } from '@nestjs/common';
import inspector from 'inspector';
import { Scope } from './scope.interface';
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
    // console.log('🔍 Extracting scope...');
    // console.log(
    //   '   scopeChain types:',
    //   frame.scopeChain.map((s) => s.type),
    // );

    const isInsideFunction =
      !!(frame.functionName && frame.functionName !== '(anonymous)');

    const local = await this.extractLocalVariables(frame, isInsideFunction);
    // console.log('   📦 Local vars:', Object.keys(local));

    const closure = await this.extractClosureVariables(frame, isInsideFunction);
    // console.log('   🔒 Closure vars:', Object.keys(closure));

    const global = await this.extractGlobalVariables(frame, isInsideFunction);
    // console.log('   🌍 Global vars:', Object.keys(global));

    return {
      local,
      closure,
      global,
    };
  }
  /**
   * Извлекает локальные переменные из текущего фрейма
   */
  async extractLocalVariables(
    frame: inspector.Debugger.CallFrame,
    isInsideFunction: boolean,
  ): Promise<Record<string, unknown>> {
    const locals: Record<string, unknown> = {};

    // Проверяем local scope (параметры и локальные переменные функции)
    const localScope = frame.scopeChain.find((s) => s.type === 'local');

    // console.log('      🔎 Local scope found:', !!localScope);

    if (localScope && localScope.object.objectId) {
      const properties = await this.variableSerializer.getProperties(
        localScope.object.objectId,
      );
      // console.log(
      //   '      🔎 Local properties:',
      //   properties.map((p) => p.name),
      // );
      properties.forEach((prop) => {
        locals[prop.name] = prop.value;
      });
    }

    // Проверяем block scope (переменные в циклах, if, и т.д.) - последними для приоритета
    if (isInsideFunction) {
      const blockScopes = frame.scopeChain.filter((s) => s.type === 'block');
      // console.log('      🔎 Block scopes found:', blockScopes.length);
      for (const blockScope of blockScopes) {
        if (blockScope.object.objectId) {
          const properties = await this.variableSerializer.getProperties(
            blockScope.object.objectId,
          );
          // console.log(
          //   '      🔎 Block properties:',
          //   properties.map((p) => p.name),
          // );
          properties.forEach((prop) => {
            locals[prop.name] = prop.value;
          });
        }
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
    isInsideFunction: boolean,
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
   * Извлекает глобальные переменные из script scope
   * (переменные верхнего уровня: let/const/var)
   */
  async extractGlobalVariables(
    frame: inspector.Debugger.CallFrame,
    isInsideFunction: boolean,
  ): Promise<Record<string, unknown>> {
    const globals: Record<string, unknown> = {};

    // Добавляем script scope переменные
    const scriptScope = frame.scopeChain.find((s) => s.type === 'script');
    // console.log('      🔎 Script scope found:', !!scriptScope);
    if (scriptScope && scriptScope.object.objectId) {
      // console.log('      🔎 Script objectId:', scriptScope.object.objectId);
      const properties = await this.variableSerializer.getProperties(
        scriptScope.object.objectId,
      );
      // console.log(
      //   '      🔎 Script properties:',
      //   properties.map((p) => p.name),
      // );
      properties.forEach((prop) => {
        globals[prop.name] = prop.value;
      });
    }

    // Если НЕ внутри функции, добавляем block scope в Global
    if (!isInsideFunction) {
      const blockScopes = frame.scopeChain.filter((s) => s.type === 'block');
      // console.log('      🔎 Global block scopes found:', blockScopes.length);
      for (const blockScope of blockScopes) {
        if (blockScope.object.objectId) {
          const properties = await this.variableSerializer.getProperties(
            blockScope.object.objectId,
          );
          // console.log(
          //   '      🔎 Global block properties:',
          //   properties.map((p) => p.name),
          // );
          properties.forEach((prop) => {
            globals[prop.name] = prop.value;
          });
        }
      }
    }

    return globals;
  }
}
