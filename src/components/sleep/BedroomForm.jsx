import { useState, useEffect } from 'react';
import * as bedroomService from '../../services/bedroomService';
import TemperatureSlider from '../ui/TemperatureSlider';

/**
 * BedroomForm component for creating or editing a bedroom.
 * - Accepts initialData for edit mode, or blank for create mode.
 * - Uses dropdowns/sliders for all valid values (no free text except notes).
 * - Passes userId and submitLabel as needed for context.
 * - Calls onSuccess with the new/updated bedroom, and onCancel to close the form.
 */
function BedroomForm({ initialData = {}, userId, onSuccess, onCancel, submitLabel = 'Add Bedroom' }) {
    // Dropdown options
    const BED_TYPES = ['bed', 'futon', 'couch', 'floor'];
    const MATTRESS_TYPES = ['memory foam', 'innerspring', 'latex', 'hybrid', 'futon', 'air', 'water', 'other'];
    const BED_SIZES = ['twin', 'full', 'queen', 'king', 'california king', 'single', 'double', 'other'];
    const LIGHT_LEVELS = ['very bright', 'bright', 'moderate', 'dim', 'very dim'];
    const NOISE_LEVELS = ['loud', 'moderate', 'quiet', 'very quiet'];
    const PILLOW_OPTIONS = ['none', 'one', 'two', 'three or more'];

    // Initial form state (use initialData for edit, defaults for create)
    const [formData, setFormData] = useState({
        bedroomName: initialData.bedroomName || '',
        bedType: initialData.bedType || 'bed',
        mattressType: initialData.mattressType || '',
        bedSize: initialData.bedSize || '',
        temperature: typeof initialData.temperature === 'number' ? initialData.temperature : 70,
        lightLevel: initialData.lightLevel || 'moderate',
        noiseLevel: initialData.noiseLevel || 'moderate',
        pillows: initialData.pillows || 'one',
        notes: initialData.notes || '',
    });

    // Loading and error state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Keep formData in sync with initialData (for edit mode)
    useEffect(() => {
        setFormData(prev => ({ ...prev, ...initialData }));
    }, [initialData]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'temperature' ? Number(value) : value,
        }));
    };
    const handleTempChange = (value) => {
        setFormData((prev) => ({ ...prev, temperature: value }));
    };

    // Handle form submit (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let result;
            if (initialData._id) {
                // Edit mode
                result = await bedroomService.updateBedroom(initialData._id, formData);
            } else {
                // Create mode
                result = await bedroomService.createBedroom({ ...formData, ownerId: userId });
            }
            onSuccess(result);
        } catch (err) {
            console.error(err);
            setError('Failed to save bedroom.');
        } finally {
            setLoading(false);
        }
    };

    // Show mattress/size only for bed/futon
    const showMattressAndSize = formData.bedType === 'bed' || formData.bedType === 'futon';

    return (
        <form onSubmit={handleSubmit} className="p-3 border rounded">
            <h5>{initialData._id ? 'Edit Bedroom' : 'Add a New Bedroom'}</h5>

            {/* Bedroom Name */}
            <div className="mb-2">
                <label className="form-label">Name</label>
                <input
                    name="bedroomName"
                    type="text"
                    className="form-control"
                    value={formData.bedroomName}
                    onChange={handleChange}
                    required
                />
            </div>

            {/* Bed Type */}
            <div className="mb-2">
                <label className="form-label">Bed Type</label>
                <select
                    name="bedType"
                    className="form-select"
                    value={formData.bedType}
                    onChange={handleChange}
                    required
                >
                    {BED_TYPES.map((type) => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                </select>
            </div>

            {/* Mattress Type and Bed Size (dropdowns) */}
            {showMattressAndSize && (
                <>
                    <div className="mb-2">
                        <label className="form-label">Mattress Type</label>
                        <select
                            name="mattressType"
                            className="form-select"
                            value={formData.mattressType}
                            onChange={handleChange}
                        >
                            <option value="">Select...</option>
                            {MATTRESS_TYPES.map((type) => (
                                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-2">
                        <label className="form-label">Bed Size</label>
                        <select
                            name="bedSize"
                            className="form-select"
                            value={formData.bedSize}
                            onChange={handleChange}
                        >
                            <option value="">Select...</option>
                            {BED_SIZES.map((size) => (
                                <option key={size} value={size}>{size.charAt(0).toUpperCase() + size.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </>
            )}

            {/* Temperature Slider */}
            <div className="mb-2">
                <label className="form-label">Temperature (°F)</label>
                <TemperatureSlider
                    value={formData.temperature}
                    onChange={handleTempChange}
                />
            </div>

            {/* Light Level */}
            <div className="mb-2">
                <label className="form-label">Light Level</label>
                <select
                    name="lightLevel"
                    className="form-select"
                    value={formData.lightLevel}
                    onChange={handleChange}
                >
                    {LIGHT_LEVELS.map((level) => (
                        <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                    ))}
                </select>
            </div>

            {/* Noise Level */}
            <div className="mb-2">
                <label className="form-label">Noise Level</label>
                <select
                    name="noiseLevel"
                    className="form-select"
                    value={formData.noiseLevel}
                    onChange={handleChange}
                >
                    {NOISE_LEVELS.map((level) => (
                        <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                    ))}
                </select>
            </div>

            {/* Pillows */}
            <div className="mb-2">
                <label className="form-label">Pillows</label>
                <select
                    name="pillows"
                    className="form-select"
                    value={formData.pillows}
                    onChange={handleChange}
                >
                    {PILLOW_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                    ))}
                </select>
            </div>

            {/* Notes */}
            <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea
                    name="notes"
                    className="form-control"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Optional notes about this bedroom"
                />
            </div>

            {/* Error Message */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Action Buttons */}
            <div className="d-flex justify-content-between">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !formData.bedroomName}
                >
                    {loading ? (submitLabel === 'Add Bedroom' ? 'Saving...' : 'Saving...') : submitLabel}
                </button>
            </div>
        </form>
    );
}

export default BedroomForm;
