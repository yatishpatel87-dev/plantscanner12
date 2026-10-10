/**
 * Push & In-App Notification Manager for Plant Watering Reminders
 */

// Play a pleasant ambient chime using browser Web Audio API
export const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Two-tone cheerful water chime (F5 -> A5 -> C6)
    const tones = [698.46, 880.0, 1046.5];
    tones.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);

      gain.gain.setValueAtTime(0, now + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, now + index * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 0.36);
    });
  } catch (e) {
    console.warn('Audio chime unavailable:', e);
  }
};

// Check if browser supports notifications
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

// Get current permission status
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

// Request user permission for push notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem('plantscanner_notifications_enabled', 'true');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Notification permission request error:', err);
    return false;
  }
};

// Check if user enabled notifications in app
export const areNotificationsEnabled = (): boolean => {
  if (!isNotificationSupported()) return false;
  const stored = localStorage.getItem('plantscanner_notifications_enabled');
  return stored === 'true' && Notification.permission === 'granted';
};

// Set notification enabled toggle
export const setNotificationsEnabled = (enabled: boolean) => {
  localStorage.setItem('plantscanner_notifications_enabled', enabled ? 'true' : 'false');
};

// Send a browser push notification with sound
export const sendWateringPushNotification = (
  title: string,
  body: string,
  iconUrl?: string
) => {
  // Always play gentle chime
  playNotificationChime();

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  try {
    const options: NotificationOptions = {
      body,
      icon: iconUrl || '/favicon.ico',
      badge: iconUrl,
      tag: 'watering-alert',
      requireInteraction: false,
    };

    new Notification(title, options);
  } catch (e) {
    console.warn('Failed to dispatch native notification:', e);
  }
};
