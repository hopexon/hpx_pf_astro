import {
  type IntervalName,
  type PitchName,
  getIntervalName,
  intervalFretLabels,
  markedFrets,
  mod12,
  pitchNames,
} from "./constants";

import styles from "./interval.module.css";

type FretMapProps = {
  stringNumbers: number[];
  fretNumbers: number[];
  selectedStringRoots: number[];
  isIntervalMode: boolean;
  intervalModeTarget: { stringNo: number; fretNo: number } | null;
  intervalModeRootPitch: number | null;
  hiddenIntervalSet: Set<IntervalName>;
  scalePitchIndexSet: Set<number> | null;
  hiddenPitchSet: Set<PitchName>;
  selectedTuning: string;
  onFretClick: (stringNo: number, fretNo: number) => void;
};

export function FretMap({
  stringNumbers,
  fretNumbers,
  selectedStringRoots,
  isIntervalMode,
  intervalModeTarget,
  intervalModeRootPitch,
  hiddenIntervalSet,
  scalePitchIndexSet,
  hiddenPitchSet,
  selectedTuning,
  onFretClick,
}: FretMapProps) {
  return (
    <div className={styles.fret__map}>
      {stringNumbers.map((stringNo) => (
        <div key={`line_${stringNo}`} className={styles.fret__line}>
          {fretNumbers.map((fretNo) => {
            const rootIndex = selectedStringRoots[stringNo - 1] ?? 0;
            const pitchIndex = mod12(rootIndex + fretNo);
            const note = pitchNames[pitchIndex];

            if (isIntervalMode && intervalModeRootPitch !== null) {
              const semitoneDistance = pitchIndex - intervalModeRootPitch;
              const intervalName = getIntervalName(semitoneDistance);
              const isRoot =
                intervalModeTarget?.stringNo === stringNo &&
                intervalModeTarget?.fretNo === fretNo;
              const isHiddenInterval =
                intervalName !== "1" &&
                hiddenIntervalSet.has(intervalName as IntervalName);
              const isVisible = !isHiddenInterval;

              return (
                <div
                  key={`fret_${stringNo}_${fretNo}`}
                  className={[
                    styles.fret__item,
                    isVisible ? styles.fret__color : "",
                    isRoot ? styles.interval__mode__root : "",
                  ].join(" ")}
                  data-interval={isVisible ? intervalName : undefined}
                  onClick={() => onFretClick(stringNo, fretNo)}
                >
                  <span
                    className={`${styles.fret__pitch__name} ${styles.interval__name}`}
                  >
                    {isVisible
                      ? (intervalFretLabels[intervalName] ?? intervalName)
                      : ""}
                  </span>
                </div>
              );
            }

            const isInScale =
              !scalePitchIndexSet || scalePitchIndexSet.has(pitchIndex);
            const hidden = hiddenPitchSet.has(note);
            const isVisible = Boolean(selectedTuning) && isInScale && !hidden;

            return (
              <div
                key={`fret_${stringNo}_${fretNo}`}
                className={[
                  styles.fret__item,
                  isVisible ? styles.fret__color : "",
                ].join(" ")}
                data-note={isVisible ? note : undefined}
                onClick={() => onFretClick(stringNo, fretNo)}
              >
                <span className={styles.fret__pitch__name}>
                  {isVisible ? note : ""}
                </span>
              </div>
            );
          })}
        </div>
      ))}

      <div className={styles.fret__number}>
        {fretNumbers.map((fretNo) => {
          const marked = markedFrets.has(fretNo);
          return (
            <div
              key={`number_${fretNo}`}
              className={`${styles.number__item} ${marked ? styles.fret__mark : ""}`}
            >
              {fretNo}
            </div>
          );
        })}
      </div>
    </div>
  );
}
