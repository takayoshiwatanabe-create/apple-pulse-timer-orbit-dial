import { useEffect, useRef, useCallback } from "react";
import { DeviceMotion } from "expo-sensors";

interface UseFlipGestureOptions {
  onFlipDown: () => void;
  onFlipUp: () => void;
  enabled?: boolean;
  threshold?: number;
  cooldownMs?: number;
}

export function useFlipGesture({
  onFlipDown,
  onFlipUp,
  enabled = true,
  threshold = 0.8,
  cooldownMs = 500,
}: UseFlipGestureOptions) {
  const isFaceDownRef = useRef(false);
  const lastFlipTimeRef = useRef(0);
  const onFlipDownRef = useRef(onFlipDown);
  const onFlipUpRef = useRef(onFlipUp);

  onFlipDownRef.current = onFlipDown;
  onFlipUpRef.current = onFlipUp;

  const handleMotionData = useCallback(
    (data: { rotation: { gamma: number } | null }) => {
      if (!data.rotation) return;

      const { gamma } = data.rotation;
      const faceDown = Math.abs(gamma) > threshold * Math.PI;
      const now = Date.now();

      if (faceDown && !isFaceDownRef.current) {
        if (now - lastFlipTimeRef.current < cooldownMs) return;
        isFaceDownRef.current = true;
        lastFlipTimeRef.current = now;
        onFlipDownRef.current();
      } else if (!faceDown && isFaceDownRef.current) {
        if (now - lastFlipTimeRef.current < cooldownMs) return;
        isFaceDownRef.current = false;
        lastFlipTimeRef.current = now;
        onFlipUpRef.current();
      }
    },
    [threshold, cooldownMs]
  );

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let subscription: ReturnType<typeof DeviceMotion.addListener> | null = null;

    DeviceMotion.isAvailableAsync().then((available) => {
      if (cancelled || !available) return;
      DeviceMotion.setUpdateInterval(200);
      subscription = DeviceMotion.addListener(handleMotionData);
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled, handleMotionData]);
}
