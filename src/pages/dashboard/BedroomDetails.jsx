import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardContext } from '../../contexts/DashboardContext';
import * as bedroomService from '../../services/bedroomService';
import * as sleepDataService from '../../services/sleepDataService';
import { format, parseISO } from 'date-fns';


// Main BedroomDetails component
function BedroomDetails() {
    // Get bedroom name from URL params and navigation function
    const { bedroomname } = useParams();
    const navigate = useNavigate();

    // Get dashboard data and refresh function from context
    const { dashboardData, refreshDashboard } = useContext(DashboardContext);

    // Local state for bedroom details, edit mode, form data, delete password, usage dates, and loading
    const [bedroom, setBedroom] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [deletePassword, setDeletePassword] = useState('');
    const [usageDates, setUsageDates] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load bedroom data and usage dates on mount or when dependencies change
    useEffect(() => {
        const loadData = async () => {
            try {
                // Try to find the bedroom in dashboard context first
                let room = dashboardData?.bedrooms?.find(
                    b => b.bedroomName.toLowerCase() === bedroomname.toLowerCase()
                );

                // If not found, fetch from API
                if (!room) {
                    room = await bedroomService.getBedroomByName(bedroomname);
                }

                setBedroom(room);
                setFormData(room);

                // Get all sleep data for the owner
                const allSleepData = dashboardData?.latestSleepData
                    ? dashboardData.latestSleepData
                    : await sleepDataService.getSleepDataByUser();

                // Filter sleep data for this bedroom and sort by date descending
                const datesUsed = allSleepData
                    .filter(entry => entry.bedroom && entry.bedroom === room._id)
                    .map(entry => ({
                        id: entry._id,
                        date: entry.createdAt,
                    }))
                    .sort((a, b) => new Date(b.date) - new Date(a.date));

                setUsageDates(datesUsed);
            } catch (err) {
                console.error('Failed to load bedroom details:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [bedroomname, dashboardData]);

    // Handle form input changes
    const handleChange = e => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Handle form submission for editing bedroom
    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await bedroomService.updateBedroom(bedroom._id, formData);
            setIsEditing(false);
            refreshDashboard?.();
        } catch (err) {
            console.error('Error updating bedroom:', err);
        }
    };

    // Handle bedroom deletion
    const handleDelete = async () => {
        if (!deletePassword) {
            alert('Password required');
            return;
        }
        try {
            await bedroomService.deleteBedroom(bedroom._id, deletePassword);
            refreshDashboard?.();
            navigate('/dashboard');
        } catch (err) {
            console.error('Error deleting bedroom:', err);
            alert('Failed to delete bedroom.');
        }
    };

    // Show loading state
    if (loading || !bedroom) {
        return <div>Loading bedroom details...</div>;
    }

    // Render the component UI
    return (
        <div className="container mt-4">
            <h2>{bedroom.bedroomName}</h2>
            <div className="row mt-3">
                {/* Left column: Bedroom details and edit form */}
                <div className="col-md-6">
                    {!isEditing ? (
                        <BedroomInfo
                            bedroom={bedroom}
                            onEdit={() => setIsEditing(true)}
                        />
                    ) : (
                        <BedroomEditForm
                            formData={formData}
                            handleChange={handleChange}
                            handleSubmit={handleSubmit}
                            onCancel={() => setIsEditing(false)}
                        />
                    )}
                </div>

                {/* Right column: Usage dates and delete option */}
                <div className="col-md-6">
                    <BedroomUsageList
                        usageDates={usageDates}
                        navigate={navigate}
                    />
                    <BedroomDeleteSection
                        deletePassword={deletePassword}
                        setDeletePassword={setDeletePassword}
                        handleDelete={handleDelete}
                    />
                </div>
            </div>
        </div>
    );
}

// Subcomponent: Display bedroom info
function BedroomInfo({ bedroom, onEdit }) {
    return (
        <div>
            <p><strong>Bed Type:</strong> {bedroom.bedType}</p>
            {bedroom.bedType === 'bed' && (
                <>
                    <p><strong>Mattress:</strong> {bedroom.mattressType}</p>
                    <p><strong>Size:</strong> {bedroom.bedSize}</p>
                </>
            )}
            <p><strong>Temp:</strong> {bedroom.temperature}°F</p>
            <p><strong>Light:</strong> {bedroom.lightLevel}</p>
            <p><strong>Noise:</strong> {bedroom.noiseLevel}</p>
            <p><strong>Pillows:</strong> {bedroom.pillows}</p>
            <p><strong>Notes:</strong> {bedroom.notes || 'None'}</p>
            <p><strong>Last Updated:</strong> {format(new Date(bedroom.lastUpdatedAt), 'PPP p')}</p>
            <button className="btn btn-primary me-2" onClick={onEdit}>
                Edit
            </button>
        </div>
    );
}

// Subcomponent: Edit form for bedroom
function BedroomEditForm({ formData, handleChange, handleSubmit, onCancel }) {
    return (
        <form onSubmit={handleSubmit}>
            <input
                name="bedroomName"
                value={formData.bedroomName}
                onChange={handleChange}
                className="form-control mb-2"
            />
            <select
                name="bedType"
                value={formData.bedType}
                onChange={handleChange}
                className="form-select mb-2"
            >
                <option value="bed">Bed</option>
                <option value="futon">Futon</option>
                <option value="couch">Couch</option>
                <option value="chair">Chair</option>
                <option value="bean bag">Bean Bag</option>
                <option value="sleeping bag">Sleeping Bag</option>
            </select>
            {formData.bedType === 'bed' && (
                <>
                    <select
                        name="mattressType"
                        value={formData.mattressType}
                        onChange={handleChange}
                        className="form-select mb-2"
                    >
                        <option value="memory foam">Memory Foam</option>
                        <option value="spring">Spring</option>
                        <option value="latex">Latex</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="air">Air</option>
                        <option value="water">Water</option>
                    </select>
                    <select
                        name="bedSize"
                        value={formData.bedSize}
                        onChange={handleChange}
                        className="form-select mb-2"
                    >
                        <option value="twin">Twin</option>
                        <option value="full">Full</option>
                        <option value="queen">Queen</option>
                        <option value="king">King</option>
                        <option value="california king">California King</option>
                    </select>
                </>
            )}
            <input
                name="temperature"
                type="number"
                min={50}
                max={100}
                value={formData.temperature}
                onChange={handleChange}
                className="form-control mb-2"
            />
            <select
                name="lightLevel"
                value={formData.lightLevel}
                onChange={handleChange}
                className="form-select mb-2"
            >
                {['pitch black', 'very dim', 'dim', 'normal', 'bright', 'daylight'].map(l => (
                    <option key={l} value={l}>{l}</option>
                ))}
            </select>
            <select
                name="noiseLevel"
                value={formData.noiseLevel}
                onChange={handleChange}
                className="form-select mb-2"
            >
                {['silent', 'very quiet', 'quiet', 'moderate', 'loud', 'very loud'].map(n => (
                    <option key={n} value={n}>{n}</option>
                ))}
            </select>
            <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="form-control mb-2"
                rows={3}
            />
            <button className="btn btn-success me-2" type="submit">Save</button>
            <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
}

// Subcomponent: List of sleep sessions in this bedroom
function BedroomUsageList({ usageDates, navigate }) {
    return (
        <>
            <h5 className="mt-3">Sleep Sessions in this Bedroom</h5>
            <p>Total Nights: {usageDates.length}</p>
            <ul className="list-group">
                {usageDates.map(entry => {
                    const date = format(parseISO(entry.date), 'yyyyMMdd');
                    return (
                        <li key={entry.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>{format(parseISO(entry.date), 'EEEE, MMM d')}</span>
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate(`/users/SleepData/${date}`)}
                            >
                                View
                            </button>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

// Subcomponent: Danger zone for deleting bedroom
function BedroomDeleteSection({ deletePassword, setDeletePassword, handleDelete }) {
    return (
        <div className="mt-4 border-top pt-3">
            <h6>Danger Zone</h6>
            <input
                type="password"
                placeholder="Confirm password to delete"
                className="form-control mb-2"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
            />
            <button className="btn btn-danger" onClick={handleDelete}>
                Delete Bedroom
            </button>
        </div>
    );
}

// Export main component at the bottom
export default BedroomDetails;
