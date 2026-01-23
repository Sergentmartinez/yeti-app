export const GAUGE_PRESETS = {
  pack: {
    height: 40,
    radius: 14,
    gap: 6,
    showConnectingLine: true,
    containerClassName: "",
  },
  budget: {
    height: 12,
    radius: 999,
    gap: 0,
    showConnectingLine: false,
    containerClassName: "rounded-full overflow-hidden",
  },
} as const;

export type GaugePreset = keyof typeof GAUGE_PRESETS;
