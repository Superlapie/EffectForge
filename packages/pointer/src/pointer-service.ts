import { clientToNormalized, clientToWorld, normalizedToWorld } from "./coordinates.js";

export interface PointerPosition {
  x: number;
  y: number;
  z: number;
}

export interface PointerInteractionState {
  position: PointerPosition;
  active: boolean;
  clicked: boolean;
}

/**
 * Tracks pointer position in renderer world space with normalized viewport fallback.
 */
export class PointerService {
  private worldX = 0;
  private worldY = 0;
  private normalizedX = 0.5;
  private normalizedY = 0.5;
  private aspect = 16 / 9;
  private active = false;
  private clicked = false;

  setAspect(aspect: number): void {
    this.aspect = Math.max(0.01, aspect);
    this.syncWorldFromNormalized();
  }

  getAspect(): number {
    return this.aspect;
  }

  updateFromClient(
    clientX: number,
    clientY: number,
    rect: Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">,
    aspect: number,
  ): void {
    this.aspect = Math.max(0.01, aspect);
    const normalized = clientToNormalized(clientX, clientY, rect);
    this.normalizedX = normalized.x;
    this.normalizedY = normalized.y;
    const world = clientToWorld(clientX, clientY, rect, this.aspect);
    this.worldX = world.x;
    this.worldY = world.y;
    this.active = true;
  }

  setNormalized(normalizedX: number, normalizedY: number, aspect?: number): void {
    if (aspect !== undefined) {
      this.aspect = Math.max(0.01, aspect);
    }
    this.normalizedX = normalizedX;
    this.normalizedY = normalizedY;
    this.syncWorldFromNormalized();
    this.active = true;
  }

  deactivate(): void {
    this.active = false;
  }

  markClick(): void {
    this.clicked = true;
    this.active = true;
  }

  consumeClick(): boolean {
    if (!this.clicked) {
      return false;
    }
    this.clicked = false;
    return true;
  }

  isActive(): boolean {
    return this.active;
  }

  getPosition(): PointerPosition {
    return { x: this.worldX, y: this.worldY, z: 0 };
  }

  getNormalized(): { x: number; y: number } {
    return { x: this.normalizedX, y: this.normalizedY };
  }

  toInteractionState(): PointerInteractionState {
    return {
      position: this.getPosition(),
      active: this.active,
      clicked: this.clicked,
    };
  }

  private syncWorldFromNormalized(): void {
    const world = normalizedToWorld(this.normalizedX, this.normalizedY, this.aspect);
    this.worldX = world.x;
    this.worldY = world.y;
  }
}
