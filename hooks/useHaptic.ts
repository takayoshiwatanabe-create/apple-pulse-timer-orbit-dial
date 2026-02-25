import { useCallback } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  impactLight,
  impactMedium,
  impactHeavy,
  selectionTick,
  notificationSuccess,
  notificationWarning,
} from "@/utils/haptics";

export function useHaptic() {
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);

  const light = useCallback(() => {
    if (hapticEnabled) impactLight();
  }, [hapticEnabled]);

  const medium = useCallback(() => {
    if (hapticEnabled) impactMedium();
  }, [hapticEnabled]);

  const heavy = useCallback(() => {
    if (hapticEnabled) impactHeavy();
  }, [hapticEnabled]);

  const selection = useCallback(() => {
    if (hapticEnabled) selectionTick();
  }, [hapticEnabled]);

  const success = useCallback(() => {
    if (hapticEnabled) notificationSuccess();
  }, [hapticEnabled]);

  const warning = useCallback(() => {
    if (hapticEnabled) notificationWarning();
  }, [hapticEnabled]);

  return { light, medium, heavy, selection, success, warning };
}
