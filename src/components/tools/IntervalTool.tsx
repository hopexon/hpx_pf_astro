import IntervalUsage from "./IntervalUsage";
import { FretMap } from "./FretMap";
import { useIntervalTool } from "./useIntervalTool";
import {
  type IntervalToolProps,
  intervalToggleNames,
  pitchNames,
  presetNames,
  scaleGroups,
} from "./constants";

import styles from "./interval.module.css";

export function IntervalTool(props: IntervalToolProps = {}) {
  const {
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
  } = useIntervalTool(props);

  const rootPanel = (
    <div className={styles.root__wrap}>
      {rootItems.map((rootValue, idx) => (
        <div key={`root_${idx + 1}`} className={styles.root__item}>
          <span className={styles.root__pitch}>
            {selectedTuning ? rootValue : ""}
          </span>
        </div>
      ))}
    </div>
  );

  const fretMapPanel = (
    <FretMap
      stringNumbers={stringNumbers}
      fretNumbers={fretNumbers}
      selectedStringRoots={selectedStringRoots}
      isIntervalMode={isIntervalMode}
      intervalModeTarget={intervalModeTarget}
      intervalModeRootPitch={intervalModeRootPitch}
      hiddenIntervalSet={hiddenIntervalSet}
      scalePitchIndexSet={scalePitchIndexSet}
      hiddenPitchSet={hiddenPitchSet}
      selectedTuning={selectedTuning}
      onFretClick={handleFretClick}
    />
  );

  const modeName = isIntervalMode ? (
    <div className={styles.mode__name}>
      <h2>
        MODE: Interval{" "}
        <span className={styles.mode__rootname}>Root: {intervalRootName}</span>
      </h2>
    </div>
  ) : (
    <div className={styles.mode__name}>
      <h2>MODE: Normal</h2>
    </div>
  );

  return (
    <div className={styles.content__wrap}>
      <div
        className={`${styles.selector__wrap} ${styles.handedness__selector__wrap} ${isIntervalMode ? styles.section__disabled : ""}`}
      >
        <div className={styles.selector__ttl}>
          <h2>Layout</h2>
        </div>
        <div
          className={`${styles.selector__twoButtons} ${styles.selector__handedness}`}
        >
          <button
            type="button"
            className={`${styles.select__btn} ${styles.handedness__btn} ${handedness === "left" ? styles.js__handedness__active : ""}`}
            disabled={isIntervalMode}
            onClick={() => handleHandednessChange("left")}
          >
            Lefty
          </button>
          <button
            type="button"
            className={`${styles.select__btn} ${styles.handedness__btn} ${handedness === "right" ? styles.js__handedness__active : ""}`}
            disabled={isIntervalMode}
            onClick={() => handleHandednessChange("right")}
          >
            Righty
          </button>
        </div>
      </div>

      <div
        className={`${styles.selector__wrap} ${styles.strings__number__selector__wrap} ${isIntervalMode ? styles.section__disabled : ""}`}
      >
        <div className={styles.selector__ttl}>
          <h2>Strings：{stringCount}</h2>
        </div>
        <div
          className={`${styles.btns__wrap} ${styles.selector__twoButtons} ${styles.selector__strings__number}`}
        >
          <button
            type="button"
            className={`${styles.select__btn} ${styles.strings__number__btn}`}
            disabled={isIntervalMode || stringCount >= 9}
            onClick={() => handleChangeStringCount(+1)}
          >
            +
          </button>
          <button
            type="button"
            className={`${styles.select__btn} ${styles.strings__number__btn}`}
            disabled={isIntervalMode || stringCount <= 4}
            onClick={() => handleChangeStringCount(-1)}
          >
            -
          </button>
        </div>
      </div>

      <div
        className={`${styles.selector__wrap} ${isIntervalMode ? styles.section__disabled : ""}`}
      >
        <div className={styles.selector__ttl}>
          <h2>Root</h2>
        </div>
        <div className={styles.root__selector__wrap}>
          {stringNumbers.map((stringNo) => (
            <div
              key={`root_selector_${stringNo}`}
              className={styles.root__selector}
            >
              <div
                className={styles.root__selector__label}
              >{`Str ${stringNo}`}</div>
              <select
                className={`${styles.select__btn} ${styles.root__select__btn}`}
                value={selectedStringRoots[stringNo - 1] ?? 0}
                disabled={isIntervalMode}
                onChange={(event) =>
                  handleRootChange(stringNo, Number(event.target.value))
                }
              >
                {pitchNames.map((pitch, idx) => (
                  <option key={`${stringNo}_${pitch}`} value={idx}>
                    {pitch}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`${styles.fret__map__outer} ${isIntervalMode ? styles.fret__map__interval : ""}`}
      >
        {modeName}
        <div
          ref={fretMapWrapRef}
          className={`${styles.fret__map__wrap} js-map_wrap_1`}
        >
          {handedness === "left" ? (
            <>
              {fretMapPanel}
              {rootPanel}
            </>
          ) : (
            <>
              {rootPanel}
              {fretMapPanel}
            </>
          )}
        </div>
      </div>
      {isIntervalMode ? (
        <div key="interval-section" className={styles.pitch__section}>
          <div className={styles.selector__wrap}>
            <div className={styles.selector__ttl}>
              <h2>Interval</h2>
            </div>
            <div
              className={`${styles.selector__multiButtons} ${styles.selector__interval}`}
            >
              {intervalToggleNames.map((name) => {
                const active = !hiddenIntervalSet.has(name);
                return (
                  <button
                    key={name}
                    type="button"
                    className={`${styles.pitch__btn} ${active ? styles.js__pitch__active : ""}`}
                    onClick={() => handleIntervalToggle(name)}
                  >
                    {name}
                  </button>
                );
              })}
              <button
                type="button"
                className={`${styles.pitch__btn} ${styles.btn__hide}`}
                onClick={handleIntervalHideAll}
              >
                Hide
              </button>
              <button
                type="button"
                className={`${styles.pitch__btn} ${styles.btn__reset}`}
                onClick={handleIntervalReset}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div key="pitch-section" className={styles.pitch__section}>
          <div className={styles.selector__wrap}>
            <div className={styles.selector__ttl}>
              <h2>Pitch</h2>
            </div>
            <div
              className={`${styles.selector__multiButtons} ${styles.selector__pitch}`}
            >
              {pitchNames.map((pitch) => {
                const isDisabledByScale = disabledPitchSetByScale.has(pitch);
                const active = !isDisabledByScale && !hiddenPitchSet.has(pitch);
                return (
                  <button
                    key={pitch}
                    type="button"
                    className={`${styles.pitch__btn} ${active ? styles.js__pitch__active : ""} ${isDisabledByScale ? styles.is__pitch__disabled : ""}`}
                    disabled={isDisabledByScale}
                    onClick={() => handlePitchToggle(pitch)}
                  >
                    {pitch}
                  </button>
                );
              })}
              <button
                type="button"
                className={`${styles.pitch__btn} ${styles.btn__hide}`}
                onClick={handleHideAll}
              >
                Hide
              </button>
              <button
                type="button"
                className={`${styles.pitch__btn} ${styles.btn__reset}`}
                onClick={handleResetPitch}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`${styles.selector__wrap} ${isIntervalMode ? styles.section__disabled : ""}`}
      >
        <div className={styles.selector__ttl}>
          <h2>Scale</h2>
        </div>
        <div className={styles.scale__selector__wrap}>
          {scaleGroups.map((group) => (
            <div
              key={group.root}
              className={`${styles.scale__selector} ${selectedScale && group.items.includes(selectedScale) ? styles.js__scale__active : ""}`}
            >
              <select
                className={styles.scale__btn}
                value={
                  selectedScale && group.items.includes(selectedScale)
                    ? selectedScale
                    : ""
                }
                disabled={isIntervalMode}
                onChange={(event) => handleScaleChange(event.target.value)}
              >
                <option value="">{group.root}</option>
                {group.items.map((scaleName) => (
                  <option key={scaleName} value={scaleName}>
                    {scaleName}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button
            type="button"
            className={`${styles.scale__btn} ${styles.btn__reset}`}
            disabled={isIntervalMode}
            onClick={handleResetScale}
          >
            Reset
          </button>
        </div>
      </div>

      <div
        className={`${styles.selector__wrap} ${isIntervalMode ? styles.section__disabled : ""}`}
      >
        <div className={styles.selector__ttl}>
          <h2>Tuning Preset</h2>
        </div>
        <div
          className={`${styles.selector__multiButtons} ${styles.select__preset}`}
        >
          {presetNames.map((tuningName) => (
            <button
              key={tuningName}
              type="button"
              className={`${styles.select__btn} ${styles.preset__btn}`}
              disabled={isIntervalMode}
              onClick={() => handleTuningClick(tuningName)}
            >
              {tuningName}
            </button>
          ))}
        </div>
      </div>

      <IntervalUsage />
    </div>
  );
}
