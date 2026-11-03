import tuningsJson from "./json/tunings.json";
import scalesJson from "./json/scales.json";

// = tuningpresetname<stringnumber(※string), noteindex(0~11)>
export type TuningMap = Record<string, Record<string, number>>;
export type ScaleDefinition = {
  rootIndex: number;
  intervals: number[];
};
export type ScaleMap = Record<string, ScaleDefinition>;
export type Handedness = "left" | "right";

export type IntervalToolProps = {
  handedness?: Handedness;
  onHandednessChange?: (value: Handedness) => void;
};

export const tunings = tuningsJson as TuningMap;
export const scales = scalesJson as ScaleMap;

export const FRET_COUNT = 24;
export const defaultStringCount = 6;

export const pitchNames = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "Bb",
  "B",
] as const;
export type PitchName = (typeof pitchNames)[number];

export const scaleGroups = [
  { root: "C", items: ["CM", "CM Penta", "Cm Penta"] },
  { root: "D", items: ["D Major"] },
  { root: "E", items: ["EM Penta", "Em Penta"] },
  { root: "A", items: ["AM Penta", "Am Penta"] },
];

export const markedFrets = new Set([3, 5, 7, 9, 12, 15, 17, 19, 21]);

// interval names mapped by mod12 index (0・11)
// tension notation is used for 2nd→9, 4th→11, #4→#11, 6th→13
export const basicIntervalNames: Record<number, string> = {
  0: "1",
  1: "b2",
  2: "9",
  3: "b3",
  4: "3",
  5: "11",
  6: "b5(#11)",
  7: "5",
  8: "b6(#5)",
  9: "13",
  10: "b7",
  11: "7",
};

// display labels for fret cells (some intervals need multi-line display)
export const intervalFretLabels: Record<string, string> = {
  "b5(#11)": "b5\n(#11)",
  "b6(#5)": "b6\n(#5)",
};

// all toggleable interval names (root '1' is always visible)
export const intervalToggleNames = [
  "b2",
  "9",
  "b3",
  "3",
  "11",
  "b5(#11)",
  "5",
  "b6(#5)",
  "13",
  "b7",
  "7",
] as const;
export type IntervalName = (typeof intervalToggleNames)[number];

export const defaultHiddenIntervalSet = [
  "b2",
  "b3",
  "b5(#11)",
  "b6(#5)",
  "b7",
] as const satisfies readonly IntervalName[];

export const presetNames = Object.keys(tunings);
export const defaultPresetName = presetNames.includes("Standard")
  ? "Standard"
  : (presetNames[0] ?? "");

// a function to count pitch index with mod 12
export function mod12(value: number): number {
  return ((value % 12) + 12) % 12;
}

// returns interval name string based on semitone distance from the root
export function getIntervalName(semitoneDistance: number): string {
  return basicIntervalNames[mod12(semitoneDistance)] ?? "";
}

// if the app lost default tuning, all strings will be set to C(0)
export function createDefaultStringRoots(stringCount: number): number[] {
  return Array.from({ length: stringCount }, () => 0);
}

// creates string roots from a tuning preset
export function createStringRootsByTuning(
  tuningName: string,
  stringCount: number,
): number[] {
  const tuning = tunings[tuningName];
  if (!tuning) {
    return createDefaultStringRoots(stringCount);
  }
  return Array.from({ length: stringCount }, (_, idx) => {
    const value = tuning[String(idx + 1)];
    if (typeof value !== "number") return 0;
    return mod12(value);
  });
}

export function createDefaultHiddenIntervalSet(): Set<IntervalName> {
  return new Set<IntervalName>(defaultHiddenIntervalSet);
}
