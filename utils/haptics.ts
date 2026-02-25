import * as Haptics from "expo-haptics";

export function impactLight(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function impactMedium(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function impactHeavy(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export function notificationSuccess(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function notificationWarning(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export function notificationError(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export function selectionTick(): void {
  Haptics.selectionAsync();
}
