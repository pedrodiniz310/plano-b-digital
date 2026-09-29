import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

let enabled = false;
const subscribers = new Set<() => void>();
let subscription: ReturnType<typeof AccessibilityInfo.addEventListener> | undefined;

function update(value: boolean) {
  enabled = value;
  subscribers.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  if (!subscription) {
    void AccessibilityInfo.isReduceMotionEnabled().then(update).catch(() => {});
    subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', update);
  }
  return () => {
    subscribers.delete(notify);
    if (subscribers.size === 0) {
      subscription?.remove();
      subscription = undefined;
    }
  };
}

export function useReduceMotion() {
  return useSyncExternalStore(subscribe, () => enabled, () => enabled);
}
