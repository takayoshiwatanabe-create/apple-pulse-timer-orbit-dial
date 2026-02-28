import { Audio } from "expo-av";

/**
 * Configure the iOS AVAudioSession before every playback.
 * Must not be cached — the system can deactivate the session
 * when the app goes to background and returns.
 */
async function configureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });
}

export async function playTimerComplete(): Promise<void> {
  try {
    await configureAudioMode();
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/sounds/timer_complete.wav"),
      { shouldPlay: true, volume: 1.0 }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    console.warn("Sound playback failed:", e);
  }
}
