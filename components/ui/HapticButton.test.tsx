import { describe, it, expect, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { HapticButton } from "./HapticButton";

const mockHaptic = {
  light: jest.fn(),
  medium: jest.fn(),
  heavy: jest.fn(),
  selection: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
};

jest.mock("@/hooks/useHaptic", () => ({
  useHaptic: () => mockHaptic,
}));

jest.mock("@/hooks/useColorScheme", () => ({
  useAppColors: () => ({
    tint: "#FF6B35",
    disabled: "#C7C7CC",
    text: "#000000",
  }),
}));

describe("HapticButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with a label", () => {
    render(<HapticButton onPress={jest.fn()} label="Start" />);
    expect(screen.getByText("Start")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<HapticButton onPress={onPress} label="Start" />);
    fireEvent.press(screen.getByText("Start"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("triggers medium haptic for primary variant", () => {
    render(
      <HapticButton onPress={jest.fn()} label="Start" variant="primary" />
    );
    fireEvent.press(screen.getByText("Start"));
    expect(mockHaptic.medium).toHaveBeenCalled();
  });

  it("triggers light haptic for secondary variant", () => {
    render(
      <HapticButton onPress={jest.fn()} label="Reset" variant="secondary" />
    );
    fireEvent.press(screen.getByText("Reset"));
    expect(mockHaptic.light).toHaveBeenCalled();
  });

  it("triggers selection haptic for ghost variant", () => {
    render(
      <HapticButton onPress={jest.fn()} label="Skip" variant="ghost" />
    );
    fireEvent.press(screen.getByText("Skip"));
    expect(mockHaptic.selection).toHaveBeenCalled();
  });

  it("has button accessibility role", () => {
    render(<HapticButton onPress={jest.fn()} label="Start" />);
    expect(screen.getByRole("button")).toBeTruthy();
  });

  it("uses custom accessibilityLabel when provided", () => {
    render(
      <HapticButton
        onPress={jest.fn()}
        label="Go"
        accessibilityLabel="Start timer"
      />
    );
    expect(screen.getByLabelText("Start timer")).toBeTruthy();
  });

  it("sets disabled accessibility state", () => {
    render(
      <HapticButton onPress={jest.fn()} label="Start" disabled={true} />
    );
    const button = screen.getByRole("button");
    expect(button.props.accessibilityState).toEqual({ disabled: true });
  });
});
