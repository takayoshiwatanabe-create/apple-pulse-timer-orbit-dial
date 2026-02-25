import { describe, it, expect, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { CircularTimer } from "./CircularTimer";

jest.mock("@/hooks/useColorScheme", () => ({
  useAppColors: () => ({
    text: "#000000",
    textSecondary: "#888888",
    focusRing: "#FF6B35",
    breakRing: "#34C759",
    longBreakRing: "#5856D6",
  }),
}));

jest.mock("@/components/timer/ProgressRing", () => {
  const { View } = require("react-native");
  return {
    ProgressRing: (props: Record<string, unknown>) => (
      <View testID="progress-ring" {...props} />
    ),
  };
});

describe("CircularTimer", () => {
  it("renders the formatted time", () => {
    render(
      <CircularTimer
        timeRemaining={1500}
        progress={0}
        sessionType="focus"
        isRunning={false}
      />
    );
    expect(screen.getByText("25:00")).toBeTruthy();
  });

  it("shows Focus label for focus session", () => {
    render(
      <CircularTimer
        timeRemaining={1500}
        progress={0}
        sessionType="focus"
        isRunning={false}
      />
    );
    expect(screen.getByText("Focus")).toBeTruthy();
  });

  it("shows Break label for break session", () => {
    render(
      <CircularTimer
        timeRemaining={300}
        progress={0}
        sessionType="break"
        isRunning={false}
      />
    );
    expect(screen.getByText("Break")).toBeTruthy();
  });

  it("shows Long Break label for long_break session", () => {
    render(
      <CircularTimer
        timeRemaining={900}
        progress={0}
        sessionType="long_break"
        isRunning={false}
      />
    );
    expect(screen.getByText("Long Break")).toBeTruthy();
  });

  it("shows Running status when running", () => {
    render(
      <CircularTimer
        timeRemaining={1500}
        progress={0.5}
        sessionType="focus"
        isRunning={true}
      />
    );
    expect(screen.getByText("Running")).toBeTruthy();
  });

  it("shows Paused status when not running", () => {
    render(
      <CircularTimer
        timeRemaining={1500}
        progress={0}
        sessionType="focus"
        isRunning={false}
      />
    );
    expect(screen.getByText("Paused")).toBeTruthy();
  });

  it("has an accessibility label with session info", () => {
    const { getByLabelText } = render(
      <CircularTimer
        timeRemaining={1500}
        progress={0}
        sessionType="focus"
        isRunning={false}
      />
    );
    expect(
      getByLabelText("Focus timer: 25:00 remaining")
    ).toBeTruthy();
  });
});
