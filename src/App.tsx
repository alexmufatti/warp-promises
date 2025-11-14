import { useState } from 'react'
import './App.css'

// WarpPromises – speed-of-light calculator using relativistic time dilation.
// Given: t_earth (real time passed on Earth) and t_person (time perceived by the person).
// We assume, as a thought experiment, that the person actually travels
// at constant speed v relative to Earth.
// Formula: t_person = t_earth * sqrt(1 - v^2 / c^2)
//  => sqrt(1 - v^2 / c^2) = t_person / t_earth = r
//  => v/c = sqrt(1 - r^2)
// We display the result as a percentage of the speed of light.

const SPEED_OF_LIGHT_KM_S = 299_792.458 // km/s
const EARTH_MOON_DISTANCE_KM = 384_400 // average distance
const EARTH_CIRCUMFERENCE_KM = 40_075 // equatorial circumference

function parseMinutes(value: string): number | null {
  if (!value.trim()) return null
  const normalized = value.replace(',', '.')
  const n = Number(normalized)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

function computeVelocityFraction(tEarthMin: number, tPersonMin: number): number | null {
  if (tPersonMin <= 0 || tEarthMin <= 0) return null
  if (tPersonMin > tEarthMin) {
    // No real relativistic solution: r > 1
    return null
  }
  const r = tPersonMin / tEarthMin
  const r2 = r * r
  const inside = 1 - r2
  if (inside < 0) return null
  return Math.sqrt(inside) // v/c
}

function formatPercent(x: number, digits = 2): string {
  return (x * 100).toFixed(digits) + ' %'
}

function formatFactor(tEarthMin: number, tPersonMin: number): string {
  const factor = tEarthMin / tPersonMin
  return factor.toFixed(2) + 'x'
}

function formatNumber(x: number, digits = 1): string {
  return x.toFixed(digits)
}

function App() {
  const [predicted, setPredicted] = useState('5')
  const [actual, setActual] = useState('60')

  const predictedMinutes = parseMinutes(predicted)
  const actualMinutes = parseMinutes(actual)

  const hasValidInputs =
    predictedMinutes !== null &&
    actualMinutes !== null &&
    predictedMinutes > 0 &&
    actualMinutes > 0

  const vOverC =
    hasValidInputs && actualMinutes && predictedMinutes
      ? computeVelocityFraction(actualMinutes, predictedMinutes)
      : null

  const showNoSolution =
    hasValidInputs &&
    predictedMinutes !== null &&
    actualMinutes !== null &&
    predictedMinutes > actualMinutes

  const timeFactor =
    hasValidInputs &&
    predictedMinutes !== null &&
    actualMinutes !== null
      ? formatFactor(actualMinutes, predictedMinutes)
      : null

  const speedKmPerS = vOverC !== null ? vOverC * SPEED_OF_LIGHT_KM_S : null

  const moonSeconds = speedKmPerS ? EARTH_MOON_DISTANCE_KM / speedKmPerS : null
  const lapsPerSecond = speedKmPerS ? speedKmPerS / EARTH_CIRCUMFERENCE_KM : null

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          Warp<span>Promises</span>
        </h1>
        <p className="subtitle">
          Welcome to WarpPromises: pretend they&apos;re literally moving through space and ask how fast
          they&apos;d have to travel so that their
          <strong> promised</strong> minutes match the
          <strong> actual</strong> minutes you waited on Earth.
        </p>
        <p className="subtitle small">
          Plug in what they said vs what really happened and WarpPromises will treat them as if they
          were actually cruising at a relativistic speed.
        </p>
      </header>

      <main className="card">
        <div className="inputs-grid">
          <div className="field">
            <label htmlFor="predicted">Promised time</label>
            <div className="field-line">
              <input
                id="predicted"
                type="text"
                inputMode="decimal"
                value={predicted}
                onChange={(e) => setPredicted(e.target.value)}
                aria-describedby="predicted-help"
              />
              <span className="suffix">min</span>
            </div>
            <p id="predicted-help" className="field-help">
              e.g. <code>2</code>, <code>5</code>, <code>0.5</code>
            </p>
          </div>

          <div className="field">
            <label htmlFor="actual">Actual time</label>
            <div className="field-line">
              <input
                id="actual"
                type="text"
                inputMode="decimal"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                aria-describedby="actual-help"
              />
              <span className="suffix">min</span>
            </div>
            <p id="actual-help" className="field-help">
              How long you actually waited on Earth.
            </p>
          </div>
        </div>

        <section className="result-section">
          {!hasValidInputs && (
            <p className="result muted">
              Enter two positive numbers (in minutes) to see at what speed they&apos;d effectively be
              travelling according to WarpPromises.
            </p>
          )}

          {hasValidInputs && showNoSolution && (
            <p className="result error">
              No relativity needed here: if they were <strong>faster</strong> than promised, just
              enjoy the miracle.
            </p>
          )}

          {hasValidInputs && !showNoSolution && vOverC === null && (
            <p className="result error">
              These numbers don&apos;t quite make sense. Try different values.
            </p>
          )}

          {hasValidInputs && !showNoSolution && vOverC !== null && (
            <>
              <p className="result main-number">
                In this little WarpPromises thought experiment, they&apos;d effectively be moving at
                <br />
                <span className="highlight">{formatNumber(speedKmPerS ?? 0, 0)} km/s</span>
                <br />
              </p>
              {speedKmPerS !== null && (
                <p className="result detail">
                  That&apos;s about{' '}
                  <span className="inline-highlight">
                    {formatPercent(vOverC, 4)} of the speed of light
                  </span>
                  .
                </p>
              )}

              {timeFactor && (
                <p className="result detail">
                  From their point of view, time would actually tick {timeFactor} slower than on
                  Earth.
                </p>
              )}

              <div className="result comparisons">
                {moonSeconds !== null && (
                  <p>
                    • At that speed, a one-way trip to the Moon (≈384,400 km) would take ~
                    {moonSeconds < 1
                      ? ` ${formatNumber(moonSeconds * 1000, 0)} ms`
                      : ` ${formatNumber(moonSeconds, 1)} s`}
                    .
                  </p>
                )}

                {lapsPerSecond !== null && (
                  <p>
                    • They&apos;d be circling Earth (40,075 km) about ~
                    {lapsPerSecond < 10
                      ? ` ${formatNumber(lapsPerSecond, 2)}`
                      : ` ${formatNumber(lapsPerSecond, 0)}`}{' '}
                    times every second.
                  </p>
                )}
              </div>

              <p className="result nerdy">
                All of this assumes they&apos;re actually moving at a constant relativistic speed and we
                apply the usual time dilation used by WarpPromises:
                <br />
                <code>t_person = t_earth · √(1 - v² / c²)</code>
              </p>
            </>
          )}
        </section>

        <section className="examples">
          <h2>Quick presets</h2>
          <ul>
            <li>
              “I&apos;ll call you in 5 minutes” → actually calls after 60 min ⇒{' '}
              <button
                type="button"
                className="example-btn"
                onClick={() => {
                  setPredicted('5')
                  setActual('60')
                }}
              >
                load values
              </button>
            </li>
            <li>
              “I&apos;ll be there in 10 minutes” → arrives after 2 hours (120 min) ⇒{' '}
              <button
                type="button"
                className="example-btn"
                onClick={() => {
                  setPredicted('10')
                  setActual('180')
                }}
              >
                load values
              </button>
            </li>
            <li>
              “Two minutes and I&apos;m there” → shows up after 30 min ⇒{' '}
              <button
                type="button"
                className="example-btn"
                onClick={() => {
                  setPredicted('2')
                  setActual('30')
                }}
              >
                load values
              </button>
            </li>
          </ul>
        </section>

        <footer className="footer">
          <p>
            WarpPromises is a nerdy side project to treat lateness as if people were actually
            travelling at relativistic speeds. No humans were harmed in these calculations.
          </p>
        </footer>
      </main>
    </div>
  )
}

export default App
