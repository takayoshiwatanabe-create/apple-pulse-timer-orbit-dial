import * as Haptics from "expo-haptics";

// --- Single Haptic Primitives ---

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

// --- Haptic Pattern Engine ---

type HapticStep =
  | { type: "impact"; style: Haptics.ImpactFeedbackStyle }
  | { type: "notification"; style: Haptics.NotificationFeedbackType }
  | { type: "selection" }
  | { type: "delay"; ms: number };

export type HapticPattern = HapticStep[];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function playPattern(pattern: HapticPattern): Promise<void> {
  for (const step of pattern) {
    switch (step.type) {
      case "impact":
        await Haptics.impactAsync(step.style);
        break;
      case "notification":
        await Haptics.notificationAsync(step.style);
        break;
      case "selection":
        await Haptics.selectionAsync();
        break;
      case "delay":
        await delay(step.ms);
        break;
    }
  }
}

// --- Predefined Patterns ---

export const HAPTIC_PATTERNS = {
  timerStart: [
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Medium },
    { type: "delay", ms: 80 },
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Heavy },
  ] as HapticPattern,

  timerPause: [
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Light },
  ] as HapticPattern,

  timerReset: [
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Medium },
    { type: "delay", ms: 100 },
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Light },
  ] as HapticPattern,

  sessionComplete: [
    { type: "notification", style: Haptics.NotificationFeedbackType.Success },
    { type: "delay", ms: 200 },
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Heavy },
    { type: "delay", ms: 150 },
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Medium },
  ] as HapticPattern,

  breakStart: [
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Light },
    { type: "delay", ms: 120 },
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Light },
  ] as HapticPattern,

  bezelTick: [
    { type: "selection" },
  ] as HapticPattern,

  bezelSnap: [
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Medium },
  ] as HapticPattern,

  flipDetected: [
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Heavy },
    { type: "delay", ms: 100 },
    { type: "notification", style: Haptics.NotificationFeedbackType.Success },
  ] as HapticPattern,

  warning: [
    { type: "notification", style: Haptics.NotificationFeedbackType.Warning },
    { type: "delay", ms: 250 },
    { type: "notification", style: Haptics.NotificationFeedbackType.Warning },
  ] as HapticPattern,

  milestone: [
    { type: "notification", style: Haptics.NotificationFeedbackType.Success },
    { type: "delay", ms: 150 },
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Heavy },
    { type: "delay", ms: 100 },
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Medium },
    { type: "delay", ms: 100 },
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Light },
  ] as HapticPattern,

  buttonPrimary: [
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Medium },
  ] as HapticPattern,

  buttonSecondary: [
    { type: "impact", style: Haptics.ImpactFeedbackStyle.Light },
  ] as HapticPattern,
} as const;

// --- Convenience Wrappers ---

export function timerStart(): Promise<void> {
  return playPattern(HAPTIC_PATTERNS.timerStart);
}

export function timerPause(): Promise<void> {
  return playPattern(HAPTIC_PATTERNS.timerPause);
}

export function timerReset(): Promise<void> {
  return playPattern(HAPTIC_PATTERNS.timerReset);
}

export function sessionComplete(): Promise<void> {
  return playPattern(HAPTIC_PATTERNS.sessionComplete);
}

export function breakStart(): Promise<void> {
  return playPattern(HAPTIC_PATTERNS.breakStart);
}

export function bezelTick(): void {
  Haptics.selectionAsync();
}

export function bezelSnap(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function flipDetected(): Promise<void> {
  return playPattern(HAPTIC_PATTERNS.flipDetected);
}

export function warningPattern(): Promise<void> {
  return playPattern(HAPTIC_PATTERNS.warning);
}

export function milestone(): Promise<void> {
  return playPattern(HAPTIC_PATTERNS.milestone);
}
