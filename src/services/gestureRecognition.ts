import { GestureState } from '../types';

export class GestureRecognizer {
  private initialDistance: number = 0;
  private initialAngle: number = 0;
  private touchStartTime: number = 0;
  private startX: number = 0;
  private startY: number = 0;
  private longPressTimer: NodeJS.Timeout | null = null;
  private dwellTimer: NodeJS.Timeout | null = null;
  private listeners: Set<(state: GestureState) => void> = new Set();

  public attach(element: HTMLElement) {
    element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
  }

  public detach(element: HTMLElement) {
    element.removeEventListener('touchstart', this.handleTouchStart);
    element.removeEventListener('touchmove', this.handleTouchMove);
    element.removeEventListener('touchend', this.handleTouchEnd);
  }

  public subscribe(callback: (state: GestureState) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private emit(state: GestureState) {
    this.listeners.forEach((fn) => fn(state));
  }

  private handleTouchStart = (e: TouchEvent) => {
    this.touchStartTime = Date.now();

    // 1-finger start coordinates
    if (e.touches.length === 1) {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;

      // Long press detection (500ms) (Step 12)
      this.longPressTimer = setTimeout(() => {
        this.emit({ type: 'longpress' });
      }, 500);

      // Dwell time tracking
      this.dwellTimer = setTimeout(() => {
        this.emit({ type: 'dwell', dwellTarget: 'editor' });
      }, 1000);
    }

    // 2-finger gestures: Pinch and Rotate (Step 12)
    if (e.touches.length === 2) {
      if (this.longPressTimer) clearTimeout(this.longPressTimer);
      if (this.dwellTimer) clearTimeout(this.dwellTimer);

      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.initialDistance = Math.hypot(dx, dy);
      this.initialAngle = Math.atan2(dy, dx);

      // Two-finger tap
      this.emit({ type: 'tap2' });
    }
  };

  private handleTouchMove = (e: TouchEvent) => {
    // Cancel long press on movement
    if (this.longPressTimer) clearTimeout(this.longPressTimer);
    if (this.dwellTimer) clearTimeout(this.dwellTimer);

    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);
      const currentAngle = Math.atan2(dy, dx);

      // Pinch to zoom with 0.05 scale threshold (Step 12)
      const scale = currentDistance / (this.initialDistance || 1);
      if (Math.abs(scale - 1) > 0.05) {
        this.emit({ type: 'pinch', scale });
      }

      // Rotation detection for 2-finger rotate (Step 12)
      const angleDiff = currentAngle - this.initialAngle;
      if (Math.abs(angleDiff) > 0.1) {
        this.emit({ type: 'rotate', angle: angleDiff });
      }
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    if (this.longPressTimer) clearTimeout(this.longPressTimer);
    if (this.dwellTimer) clearTimeout(this.dwellTimer);

    if (e.changedTouches.length === 1) {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const duration = Date.now() - this.touchStartTime;

      const deltaX = endX - this.startX;
      const deltaY = endY - this.startY;
      const distance = Math.hypot(deltaX, deltaY);

      // Velocity calculation (Step 12: pixels/ms)
      const velocity = distance / (duration || 1);

      // Swipe detection with velocity (Step 12)
      if (distance > 50 && velocity > 0.3) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          this.emit({
            type: 'swipe',
            direction: deltaX > 0 ? 'right' : 'left',
            velocity,
          });
        } else {
          this.emit({
            type: 'swipe',
            direction: deltaY > 0 ? 'down' : 'up',
            velocity,
          });
        }
      }
    }
  };
}

export const gestureRecognizer = new GestureRecognizer();
