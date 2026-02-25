import { useEffect, useRef, useCallback } from "react";
import { DeviceMotion } from "expo-sensors";

interface UseFlipGestureOptions {
  onFlipDown: () => void;
  onFlipUp: () => void;
  enabled?: boolean;
  threshold?: number;
}

export function useFlipGesture({
  onFlipDown,
  onFlipUp,
  enabled = true,
  threshold = 0.8,
}: UseFlipGestureOptions) {
  const isFaceDownRef = useRef(false);
  const onFlipDownRef = useRef(onFlipDown);
  const onFlipUpRef = useRef(onFlipUp);

  onFlipDownRef.current = onFlipDown;
  onFlipUpRef.current = onFlipUp;

  const handleMotionData = useCallback(
    (data: { rotation: { gamma: number } | null }) => {
      if (!data.rotation) return;

      const { gamma } = data.rotation;
      const faceDown = Math.abs(gamma) > threshold * Math.PI;

      if (faceDown && !isFaceDownRef.current) {
        isFaceDownRef.current = true;
        onFlipDownRef.current();
      } else if (!faceDown && isFaceDownRef.current) {
        isFaceDownRef.current = false;
        onFlipUpRef.current();
      }
    },
    [threshold]
  );

  useEffect(() => {
    if (!enabled) return;

    DeviceMotion.setUpdateInterval(200);
    const subscription = DeviceMotion.addListener(handleMotionData);

    return () => {
      subscription.remove();
    };
  }, [enabled, handleMotionData]);
}
