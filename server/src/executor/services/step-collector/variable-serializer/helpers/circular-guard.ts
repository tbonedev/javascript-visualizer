/**
 * Defense from circular links during object serialization
 */

export class CircularGuard {
  private visited: Set<string> = new Set();

  isVisited(objectId: string): boolean {
    return this.visited.has(objectId);
  }

  markVisited(objectId: string): void {
    this.visited.add(objectId);
  }

  checkAndMark(objectId: string): boolean {
    if (this.isVisited(objectId)) {
      return true;
    }
    this.markVisited(objectId);
    return false;
  }

  reset(): void {
    this.visited.clear();
  }

  geCount(): number {
    return this.visited.size;
  }
}
