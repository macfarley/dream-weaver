import React from 'react';

function SemanticSlider({ 
  label,          // string: field label e.g. "Light Level"
  options,        // array of strings: enum options e.g. ['pitch black', 'dim', ...]
  value,          // string: current selected semantic value
  onChange,       // function: called with new semantic value on change
  id,             // string: unique id for input and datalist
}) {
  // Map current semantic value to its index in options array for slider position
  const valueIndex = options.indexOf(value);
  const currentIndex = valueIndex >= 0 ? valueIndex : 0;

  const handleChange = (e) => {
    const newIndex = Number(e.target.value);
    onChange(options[newIndex]);
  };

  return (
    <div className="semantic-slider mb-3">
      <label htmlFor={id} className="form-label">{label}: <strong>{value || 'None'}</strong></label>
      <input
        type="range"
        id={id}
        min="0"
        max={options.length - 1}
        step="1"
        value={currentIndex}
        onChange={handleChange}
        list={`${id}-labels`}
        className="form-range"
      />
      <datalist id={`${id}-labels`}>
        {options.map((option, i) => (
          <option key={i} value={i} label={option} />
        ))}
      </datalist>
    </div>
  );
}

export default SemanticSlider;
