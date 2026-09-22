/** Structure-of-arrays particle store with index-based object pooling. */
export class ParticleStore {
  readonly capacity: number;
  readonly position: Float32Array;
  readonly velocity: Float32Array;
  readonly age: Float32Array;
  readonly lifetime: Float32Array;
  readonly size: Float32Array;
  readonly color: Float32Array;
  readonly alive: Uint8Array;

  private readonly freeList: number[];
  activeCount = 0;

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error("ParticleStore capacity must be positive");
    }

    this.capacity = capacity;
    this.position = new Float32Array(capacity * 3);
    this.velocity = new Float32Array(capacity * 3);
    this.age = new Float32Array(capacity);
    this.lifetime = new Float32Array(capacity);
    this.size = new Float32Array(capacity);
    this.color = new Float32Array(capacity * 4);
    this.alive = new Uint8Array(capacity);

    this.freeList = new Array<number>(capacity);
    for (let i = capacity - 1; i >= 0; i--) {
      this.freeList[i] = i;
    }
  }

  get availableSlots(): number {
    return this.freeList.length;
  }

  spawn(): number | null {
    if (this.freeList.length === 0) {
      return null;
    }
    const index = this.freeList.pop()!;
    this.alive[index] = 1;
    this.activeCount += 1;
    return index;
  }

  kill(index: number): void {
    if (!this.alive[index]) {
      return;
    }
    this.alive[index] = 0;
    this.activeCount -= 1;
    this.freeList.push(index);
  }

  forEachAlive(callback: (index: number) => void): void {
    for (let i = 0; i < this.capacity; i++) {
      if (this.alive[i]) {
        callback(i);
      }
    }
  }

  positionOffset(index: number): number {
    return index * 3;
  }

  colorOffset(index: number): number {
    return index * 4;
  }
}
