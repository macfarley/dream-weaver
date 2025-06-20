import React, { useState, useEffect } from 'react';
import { Snowflake, Flame } from 'lucide-react';

/**
 * TemperatureSlider component combines a range slider with an editable input
 * for temperature values, supporting both Fahrenheit and Celsius.
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Field label displayed above the control
 * @param {number} props.value - Current temperature value
 * @param {function} props.onChange - Callback function called with new temperature value
 * @param {string} props.id - Unique identifier for the input elements
 * @param {boolean} props.useCelsius - Whether to use Celsius (true) or Fahrenheit (false)
 * @param {string} props.placeholder - Placeholder text for the input
 */
function TemperatureSlider({ 
  label,
  value,
  onChange,
  id,
  useCelsius = false,
  placeholder
}) {
  // Define temperature ranges based on unit
  const tempRange = useCelsius 
    ? { min: 0, max: 35, step: 1 }    // 0°C to 35°C (32°F to 95°F)
    : { min: 32, max: 95, step: 1 };  // 32°F to 95°F (0°C to 35°C)
  
  const unit = useCelsius ? '°C' : '°F';
  
  // Local state for the input value (string) to handle typing
  const [inputValue, setInputValue] = useState(value?.toString() || '');
  
  // Sync local input value when prop value changes
  useEffect(() => {
    setInputValue(value?.toString() || '');
  }, [value]);

  /**
   * Handles slider changes - always snaps to whole degrees
   */
  const handleSliderChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setInputValue(newValue.toString()); // Update input box immediately
    onChange(newValue);
  };

  /**
   * Handles input field changes - allows typing but validates on blur
   */
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  /**
   * Handles input blur - validates and snaps to valid range
   */
  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    
    if (isNaN(numValue)) {
      // Invalid input, revert to current value
      setInputValue(value?.toString() || '');
      return;
    }
    
    // Clamp to valid range and snap to whole number
    const clampedValue = Math.round(
      Math.max(tempRange.min, Math.min(tempRange.max, numValue))
    );
    
    setInputValue(clampedValue.toString());
    onChange(clampedValue);
  };

  /**
   * Handles Enter key in input field
   */
  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Trigger validation
    }
  };

  // Ensure value is within range for slider
  const sliderValue = Math.max(tempRange.min, Math.min(tempRange.max, value || tempRange.min));

  return (
    <div className="temperature-slider mb-3">
      {/* Label */}
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      
      {/* Input and Slider Container */}
      <div className="d-flex align-items-center gap-3">
        {/* Editable Temperature Input */}
        <div className="d-flex align-items-center">
          <input
            type="number"
            id={`${id}-input`}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyPress={handleInputKeyPress}
            className="form-control"
            style={{ width: '80px' }}
            min={tempRange.min}
            max={tempRange.max}
            step={tempRange.step}
            placeholder={placeholder}
          />
          <span className="ms-1 text-muted">{unit}</span>
        </div>
        
        {/* Cold icon */}
        <div className="text-muted" title={`${tempRange.min}${unit} (Cold)`}>
          <Snowflake size={18} />
        </div>
        
        {/* Temperature Range Slider */}
        <input
          type="range"
          id={`${id}-slider`}
          min={tempRange.min}
          max={tempRange.max}
          step={tempRange.step}
          value={sliderValue}
          onChange={handleSliderChange}
          className="form-range flex-grow-1"
          aria-describedby={`${id}-description`}
        />
        
        {/* Hot icon */}
        <div className="text-muted" title={`${tempRange.max}${unit} (Hot)`}>
          <Flame size={18} />
        </div>
      </div>
      
      {/* Range indicator */}
      <div className="d-flex justify-content-between mt-1">
        <small className="text-muted">{tempRange.min}{unit}</small>
        <small className="text-muted">{tempRange.max}{unit}</small>
      </div>
      
      {/* Hidden description for screen readers */}
      <div id={`${id}-description`} className="visually-hidden">
        Temperature slider ranging from {tempRange.min} to {tempRange.max} degrees {useCelsius ? 'Celsius' : 'Fahrenheit'}
      </div>
    </div>
  );
}

export default TemperatureSlider;
