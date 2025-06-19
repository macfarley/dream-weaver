import React from 'react';

/**
 * SemanticSlider component renders a range slider with semantic labels instead of numeric values.
 * 
 * This component is useful for capturing user preferences on scales that are more naturally
 * described with words rather than numbers (e.g., "bright" vs "3", "quiet" vs "1").
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Field label displayed above the slider (e.g., "Light Level")
 * @param {Array<string>} props.options - Array of semantic options in order from min to max value
 * @param {string} props.value - Current selected semantic value (must be one of the options)
 * @param {function} props.onChange - Callback function called with new semantic value when changed
 * @param {string} props.id - Unique identifier for the input element and associated datalist
 * 
 * Features:
 * - Maps semantic values to slider positions automatically
 * - Shows current value in human-readable format
 * - Uses HTML5 datalist for accessible option labels
 * - Bootstrap styling with form-range class
 * - Graceful fallback if current value not found in options
 * 
 * Usage Example:
 * <SemanticSlider 
 *   label="Light Level"
 *   options={['pitch black', 'dim', 'moderate', 'bright', 'very bright']}
 *   value="moderate"
 *   onChange={(newValue) => setLightLevel(newValue)}
 *   id="light-level-slider"
 * />
 */
function SemanticSlider({ 
  label,          // string: field label e.g. "Light Level"
  options,        // array of strings: enum options e.g. ['pitch black', 'dim', ...]
  value,          // string: current selected semantic value
  onChange,       // function: called with new semantic value on change
  id,             // string: unique id for input and datalist
}) {
  // Find the index of the current value in the options array
  // This maps the semantic value to a numeric position for the range slider
  const valueIndex = options.indexOf(value);
  
  // Use index 0 as fallback if current value is not found in options array
  const currentIndex = valueIndex >= 0 ? valueIndex : 0;

  /**
   * Handles slider value changes by converting numeric index back to semantic value.
   * 
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    // Convert the slider's numeric value back to semantic option
    const newIndex = Number(e.target.value);
    
    // Ensure the index is within bounds before calling onChange
    if (newIndex >= 0 && newIndex < options.length) {
      onChange(options[newIndex]);
    }
  };

  return (
    <div className="semantic-slider mb-3">
      {/* Label showing current semantic value */}
      <label htmlFor={id} className="form-label">
        {label}: <strong>{value || 'None'}</strong>
      </label>
      
      {/* Range slider input */}
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
        aria-describedby={`${id}-description`}
      />
      
      {/* Datalist provides semantic labels at slider positions */}
      <datalist id={`${id}-labels`}>
        {options.map((option, index) => (
          <option key={index} value={index} label={option} />
        ))}
      </datalist>
      
      {/* Hidden description for screen readers */}
      <div id={`${id}-description`} className="visually-hidden">
        Slider with {options.length} options ranging from {options[0]} to {options[options.length - 1]}
      </div>
    </div>
  );
}

export default SemanticSlider;
