/**
 * Safe utility wrapper for native Web Vibration / Haptic Feedback API.
 * Uses navigator.vibrate to simulate physical tactile responses on mobile devices.
 */

export const triggerLightHaptic = () => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(15);
    } catch (e) {
      // Ignored for safety
    }
  }
};

export const triggerMediumHaptic = () => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(30);
    } catch (e) {
      // Ignored for safety
    }
  }
};

export const triggerSuccessHaptic = () => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate([40, 80, 40]);
    } catch (e) {
      // Ignored for safety
    }
  }
};

export const triggerWarningHaptic = () => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate([60, 120, 60]);
    } catch (e) {
      // Ignored for safety
    }
  }
};
