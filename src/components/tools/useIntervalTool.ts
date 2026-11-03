import { useEffect, useMemo, useRef, useState } from "react";

import {
  type Handedness,
  type IntervalName,
  type IntervalToolProps,
  type PitchName,
  FRET_COUNT,
  createDefaultHiddenIntervalSet,
  createStringRootsByTuning,
  defaultPresetName,
  defaultStringCount,
  intervalToggleNames,
  mod12,
  pitchNames,
  scales,
} from "./constants";

export function useIntervalTool({
  handedness: handednessProp,
  onHandednessChange,
}: IntervalToolProps = {}) {
  const [stringCount, setStringCount] = useState(defaultStringCount);
  const [selectedTuning, setSelectedTuning] =
    useState<string>(defaultPresetName);
  const [selectedScale, setSelectedScale] = useState<string | null>(null);
  const [hiddenPitchSet, setHiddenPitchSet] = useState<Set<PitchName>>(
    new Set(),
  );
  const [selectedStringRoots, setSelectedStringRoots] = useState<number[]>(
    createStringRootsByTuning(defaultPresetName, defaultStringCount),
  );
  const [intervalModeTarget, setIntervalModeTarget] = useState<{
    stringNo: number;
    fretNo: number;
  } | null>(null);
  const [hiddenIntervalSet, setHiddenIntervalSet] = useState<Set<IntervalName>>(
    () => createDefaultHiddenIntervalSet(),
  );
  const [internalHandedness, setInternalHandedness] =
    useState<Handedness>("left");

  const handedness = handednessProp ?? internalHandedness;
  const isIntervalMode = intervalModeTarget !== null;
  const fretMapWrapRef = useRef<HTMLDivElement | null>(null);

  const fretNumbers = useMemo(() => {
    if (handedness === "left") {
      return Array.from({ length: FRET_COUNT }, (_, idx) => FRET_COUNT - idx);
    }
    return Array.from({ length: FRET_COUNT }, (_, idx) => idx + 1);
  }, [handedness]);

  const stringNumbers = useMemo(
    () => Array.from({ length: stringCount }, (_, idx) => idx + 1),
    [stringCount],
  );

  const rootItems = useMemo(
    () =>
      stringNumbers.map(
        (stringNo) => pitchNames[selectedStringRoots[stringNo - 1] ?? 0],
      ),
    [selectedStringRoots, stringNumbers],
  );

  const scalePitchIndexSet = useMemo(() => {
    if (!selectedScale) return null;
    const scale = scales[selectedScale];
    if (!scale) return null;
    return new Set(
      scale.intervals.map((interval) => mod12(scale.rootIndex + interval)),
    );
  }, [selectedScale]);

  const disabledPitchSetByScale = useMemo(() => {
    if (!scalePitchIndexSet) return new Set<PitchName>();
    return new Set(
      pitchNames.filter(
        (_, pitchIndex) => !scalePitchIndexSet.has(pitchIndex),
      ) as PitchName[],
    );
  }, [scalePitchIndexSet]);

  const intervalModeRootPitch = useMemo(() => {
    if (!intervalModeTarget) return null;
    const rootIndex = selectedStringRoots[intervalModeTarget.stringNo - 1] ?? 0;
    return mod12(rootIndex + intervalModeTarget.fretNo);
  }, [intervalModeTarget, selectedStringRoots]);

  const intervalRootName = useMemo(() => {
    if (intervalModeRootPitch === null) return "";
    return pitchNames[intervalModeRootPitch];
  }, [intervalModeRootPitch]);

  const handleTuningClick = (tuningName: string) => {
    setSelectedTuning(tuningName);
    setSelectedScale(null);
    setHiddenPitchSet(new Set());
    setSelectedStringRoots(createStringRootsByTuning(tuningName, stringCount));
  };

  const handleScaleChange = (value: string) => {
    if (!value) {
      setSelectedScale(null);
      setHiddenPitchSet(new Set());
      return;
    }
    setSelectedScale(value);
    setHiddenPitchSet(new Set());
  };

  const handleResetScale = () => {
    setSelectedScale(null);
    setHiddenPitchSet(new Set());
  };

  const handlePitchToggle = (pitch: PitchName) => {
    if (disabledPitchSetByScale.has(pitch)) return;
    setHiddenPitchSet((prev) => {
      const next = new Set(prev);
      if (next.has(pitch)) {
        next.delete(pitch);
      } else {
        next.add(pitch);
      }
      return next;
    });
  };

  const handleHideAll = () => {
    setHiddenPitchSet(new Set(pitchNames));
  };

  const handleResetPitch = () => {
    setHiddenPitchSet(new Set());
  };

  const handleIntervalToggle = (name: IntervalName) => {
    setHiddenIntervalSet((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleIntervalHideAll = () => {
    setHiddenIntervalSet(new Set(intervalToggleNames));
  };

  const handleIntervalReset = () => {
    setHiddenIntervalSet(() => createDefaultHiddenIntervalSet());
  };

  const handleRootChange = (stringNo: number, value: number) => {
    setSelectedStringRoots((prev) => {
      const next = [...prev];
      next[stringNo - 1] = mod12(value);
      return next;
    });
  };

  const handleHandednessChange = (value: Handedness) => {
    if (!handednessProp) {
      setInternalHandedness(value);
    }
    onHandednessChange?.(value);
  };

  const handleFretClick = (stringNo: number, fretNo: number) => {
    if (
      intervalModeTarget &&
      intervalModeTarget.stringNo === stringNo &&
      intervalModeTarget.fretNo === fretNo
    ) {
      setIntervalModeTarget(null);
    } else {
      setHiddenIntervalSet(() => createDefaultHiddenIntervalSet());
      setIntervalModeTarget({ stringNo, fretNo });
    }
  };

  const handleChangeStringCount = (delta: number) => {
    setStringCount((prev) => {
      const next = prev + delta;
      setSelectedStringRoots(() =>
        createStringRootsByTuning(selectedTuning, next),
      );
      return next;
    });
  };

  useEffect(() => {
    const wrap = fretMapWrapRef.current;
    if (!wrap) return;

    let fallbackTimer: number | null = null;
    const rafId = requestAnimationFrame(() => {
      const maxScrollLeft = Math.max(0, wrap.scrollWidth - wrap.clientWidth);
      if (maxScrollLeft <= 0) return;

      const targetLeft = handedness === "left" ? maxScrollLeft : 0;
      if (Math.abs(wrap.scrollLeft - targetLeft) <= 1) return;

      wrap.scrollTo({ left: targetLeft, behavior: "smooth" });

      fallbackTimer = window.setTimeout(() => {
        const latestMaxScrollLeft = Math.max(
          0,
          wrap.scrollWidth - wrap.clientWidth,
        );
        const latestTargetLeft =
          handedness === "left" ? latestMaxScrollLeft : 0;
        if (Math.abs(wrap.scrollLeft - latestTargetLeft) > 1) {
          wrap.scrollTo({ left: latestTargetLeft, behavior: "auto" });
        }
      }, 220);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
      }
    };
  }, [handedness]);

  return {
    stringCount,
    selectedTuning,
    selectedStringRoots,
    selectedScale,
    hiddenPitchSet,
    hiddenIntervalSet,
    intervalModeTarget,
    isIntervalMode,
    intervalRootName,
    handedness,
    fretMapWrapRef,
    fretNumbers,
    stringNumbers,
    rootItems,
    scalePitchIndexSet,
    disabledPitchSetByScale,
    intervalModeRootPitch,
    handleTuningClick,
    handleScaleChange,
    handleResetScale,
    handlePitchToggle,
    handleHideAll,
    handleResetPitch,
    handleIntervalToggle,
    handleIntervalHideAll,
    handleIntervalReset,
    handleRootChange,
    handleHandednessChange,
    handleFretClick,
    handleChangeStringCount,
  };
}
