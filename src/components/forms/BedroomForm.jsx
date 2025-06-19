import React, { useState } from 'react';
import { getToken } from '../../services/authService';
import * as bedroomService from '../../services/bedroomService';
import { validateBedroomName } from '../../utils/urlSafeNames';

/**
 * BedroomForm component allows users to add a new bedroom with various attributes.
 * Includes validation to ensure bedroom names are safe for URLs and user-friendly.
 * 
 * @param {function} onSuccess - Callback when bedroom is successfully created.
 * @param {function} onCancel - Callback when the form is cancelled.
 */
function BedroomForm({ onSuccess, onCancel }) {
    // Initial form state
    const [formData, setFormData] = useState({
        bedroomName: '',
        bedType: 'bed',
        mattressType: '',
        bedSize: '',
        temperature: 70,
        lightLevel: 'normal',
        noiseLevel: 'moderate',
        pillows: 'one',
    });

    // Loading and error state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [nameValidation, setNameValidation] = useState({ isValid: true });

    /**
     * Handles changes to any form input.
     * Updates the corresponding value in formData state.
     * Validates bedroom name in real-time.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Validate bedroom name in real-time
        if (name === 'bedroomName') {
            const validation = validateBedroomName(value);
            setNameValidation(validation);
        }
    };

    /**
     * Handles form submission.
     * Validates bedroom name before calling bedroomService.createBedroom.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Final validation check
        const validation = validateBedroomName(formData.bedroomName);
        if (!validation.isValid) {
            setError(validation.error);
            setLoading(false);
            return;
        }

        try {
            const token = getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            // Create new bedroom with form data (ownerId is set by backend from token)
            const newBedroom = await bedroomService.createBedroom(formData, token);
            // Notify parent of success
            onSuccess(newBedroom);
        } catch (err) {
            // Log and display error
            console.error(err);
            setError('Failed to create bedroom.');
        } finally {
            setLoading(false);
        }
    };

    // Determine if mattressType and bedSize fields should be shown
    const showMattressAndSize =
        formData.bedType === 'bed' || formData.bedType === 'futon';

    return (
        <form onSubmit={handleSubmit} className="p-3 border rounded  ">
            <h5>Add a New Bedroom</h5>

            {/* Bedroom Name */}
            <div className="mb-2">
                <label className="form-label">Name</label>
                <input
                    name="bedroomName"
                    type="text"
                    className={`form-control ${!nameValidation.isValid ? 'is-invalid' : ''}`}
                    value={formData.bedroomName}
                    onChange={handleChange}
                    required
                    maxLength="50"
                    placeholder="e.g., Master Bedroom, Guest Room"
                />
                {!nameValidation.isValid && (
                    <div className="invalid-feedback">
                        {nameValidation.error}
                    </div>
                )}
                <div className="form-text">
                    Choose a name that's easy to remember and unique (max 50 characters)
                </div>
            </div>

            {/* Bed Type Selection */}
            <div className="mb-2">
                <label className="form-label">Bed Type</label>
                <select
                    name="bedType"
                    className="form-select"
                    value={formData.bedType}
                    onChange={handleChange}
                    required
                >
                    <option value="bed">Bed</option>
                    <option value="futon">Futon</option>
                    <option value="couch">Couch</option>
                    <option value="floor">Floor</option>
                </select>
            </div>

            {/* Mattress Type and Bed Size (only for bed/futon) */}
            {showMattressAndSize && (
                <>
                    <div className="mb-2">
                        <label className="form-label">Mattress Type</label>
                        <input
                            name="mattressType"
                            type="text"
                            className="form-control"
                            value={formData.mattressType}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-2">
                        <label className="form-label">Bed Size</label>
                        <input
                            name="bedSize"
                            type="text"
                            className="form-control"
                            value={formData.bedSize}
                            onChange={handleChange}
                        />
                    </div>
                </>
            )}

            {/* Temperature Input */}
            <div className="mb-2">
                <label className="form-label">Temperature (°F)</label>
                <input
                    name="temperature"
                    type="number"
                    className="form-control"
                    min="50"
                    max="100"
                    value={formData.temperature}
                    onChange={handleChange}
                />
            </div>

            {/* Light Level Selection */}
            <div className="mb-2">
                <label className="form-label">Light Level</label>
                <select
                    name="lightLevel"
                    className="form-select"
                    value={formData.lightLevel}
                    onChange={handleChange}
                >
                    <option value="pitch black">Pitch Black</option>
                    <option value="very dim">Very Dim</option>
                    <option value="dim">Dim</option>
                    <option value="normal">Normal</option>
                    <option value="bright">Bright</option>
                    <option value="daylight">Daylight</option>
                </select>
            </div>

            {/* Noise Level Selection */}
            <div className="mb-2">
                <label className="form-label">Noise Level</label>
                <select
                    name="noiseLevel"
                    className="form-select"
                    value={formData.noiseLevel}
                    onChange={handleChange}
                >
                    <option value="silent">Silent</option>
                    <option value="very quiet">Very Quiet</option>
                    <option value="quiet">Quiet</option>
                    <option value="moderate">Moderate</option>
                    <option value="loud">Loud</option>
                    <option value="very loud">Very Loud</option>
                </select>
            </div>

            {/* Pillows Selection */}
            <div className="mb-3">
                <label className="form-label">Pillows</label>
                <select
                    name="pillows"
                    className="form-select"
                    value={formData.pillows}
                    onChange={handleChange}
                >
                    <option value="none">None</option>
                    <option value="one">One</option>
                    <option value="two">Two</option>
                    <option value="three or more">Three or more</option>
                </select>
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
                    disabled={loading || !formData.bedroomName || !nameValidation.isValid}
                >
                    {loading ? 'Saving...' : 'Add Bedroom'}
                </button>
            </div>
        </form>
    );
}

export default BedroomForm;
