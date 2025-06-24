/**
 * TemperatureSlider component for selecting a temperature value.
 * @param {number} value - The current temperature value.
 * @param {function} onChange - Callback when the value changes.
 * @param {number} min - Minimum temperature (default 50).
 * @param {number} max - Maximum temperature (default 100).
 * @param {string} unit - Temperature unit (default '°F').
 */
function TemperatureSlider({ value, onChange, min = 50, max = 100, unit = '°F' }) {
  return (
    <div className="temperature-slider d-flex align-items-center">
      <input
        type="range"
        className="form-range flex-grow-1"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        aria-label="Bedroom temperature"
      />
      <span className="ms-2" style={{ minWidth: 48 }}>
        {value}{unit}
      </span>
    </div>
  );
}

export default TemperatureSlider;
