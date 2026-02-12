
class HapticManager {
  private isSupported(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  /**
   * A very light tactile tap, ideal for keypad presses.
   */
  lightClick() {
    if (this.isSupported()) navigator.vibrate(10);
  }

  /**
   * A standard tactile click for button toggles.
   */
  mediumClick() {
    if (this.isSupported()) navigator.vibrate(35);
  }

  /**
   * A positive double-pulse pattern for successful operations.
   */
  successPulse() {
    if (this.isSupported()) navigator.vibrate([60, 40, 60]);
  }

  /**
   * A jarring triple-pulse pattern for errors or cancellations.
   */
  errorPulse() {
    if (this.isSupported()) navigator.vibrate([100, 50, 100, 50, 100]);
  }

  /**
   * A heavy single vibration for critical alerts.
   */
  heavyBuzz() {
    if (this.isSupported()) navigator.vibrate(200);
  }
}

export const haptics = new HapticManager();
