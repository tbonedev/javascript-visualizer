/**
 * Defense from infinite loops during object serialization
 * Simply limits depth to prevent backend overload
 */

export class CircularGuard {
  private depth: number = 0;
  private readonly MAX_DEPTH = 1; // только 1 уровень вложенности для объектов

  /**
   * Входим в объект - увеличиваем глубину
   */
  enterObject(): void {
    this.depth++;
  }

  /**
   * Выходим из объекта - уменьшаем глубину
   */
  exitObject(): void {
    if (this.depth > 0) {
      this.depth--;
    }
  }

  /**
   * Проверка превышения максимальной глубины
   */
  isMaxDepthReached(): boolean {
    return this.depth >= this.MAX_DEPTH;
  }

  /**
   * Сбросить состояние
   */
  reset(): void {
    this.depth = 0;
  }

  /**
   * Получить текущую глубину
   */
  getDepth(): number {
    return this.depth;
  }
}
