export interface TrailPoint {
  x: number;
  y: number;
  z: number;
}

/** Ring buffer of trail points ordered from oldest (index 0) to newest. */
export class TrailStore {
  readonly maxPoints: number;
  private readonly points: TrailPoint[];
  private head = 0;
  private count = 0;

  constructor(maxPoints: number) {
    this.maxPoints = Math.max(2, maxPoints);
    this.points = Array.from({ length: this.maxPoints }, () => ({ x: 0, y: 0, z: 0 }));
  }

  get pointCount(): number {
    return this.count;
  }

  clear(): void {
    this.head = 0;
    this.count = 0;
  }

  push(x: number, y: number, z: number): void {
    const index = this.count < this.maxPoints ? this.count : this.head;
    const point = this.points[index]!;
    point.x = x;
    point.y = y;
    point.z = z;

    if (this.count < this.maxPoints) {
      this.count += 1;
      return;
    }

    this.head = (this.head + 1) % this.maxPoints;
  }

  getPoint(index: number): TrailPoint | null {
    if (index < 0 || index >= this.count) {
      return null;
    }

    const bufferIndex =
      this.count < this.maxPoints ? index : (this.head + index) % this.maxPoints;
    return this.points[bufferIndex] ?? null;
  }

  getNewest(): TrailPoint | null {
    if (this.count === 0) {
      return null;
    }
    return this.getPoint(this.count - 1);
  }
}
