export class MinHeap<T> {
  private items: { element: T; priority: number }[] = [];

  push(element: T, priority: number): void {
    this.items.push({ element, priority });
    this.bubbleUp(this.items.length - 1);
  }

  pop(): T | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0].element;
    const bottom = this.items.pop();
    if (this.items.length > 0 && bottom !== undefined) {
      this.items[0] = bottom;
      this.sinkDown(0);
    }
    return top;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  get size(): number {
    return this.items.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.items[index].priority >= this.items[parentIdx].priority) break;
      const temp = this.items[index];
      this.items[index] = this.items[parentIdx];
      this.items[parentIdx] = temp;
      index = parentIdx;
    }
  }

  private sinkDown(index: number): void {
    const length = this.items.length;
    while (true) {
      let leftIdx = 2 * index + 1;
      let rightIdx = 2 * index + 2;
      let smallest = index;

      if (leftIdx < length && this.items[leftIdx].priority < this.items[smallest].priority) {
        smallest = leftIdx;
      }
      if (rightIdx < length && this.items[rightIdx].priority < this.items[smallest].priority) {
        smallest = rightIdx;
      }
      if (smallest === index) break;

      const temp = this.items[index];
      this.items[index] = this.items[smallest];
      this.items[smallest] = temp;
      index = smallest;
    }
  }
}
