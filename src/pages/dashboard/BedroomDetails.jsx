import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardContext } from '../../contexts/DashboardContext';
import * as bedroomService from '../../services/bedroomService';
import * as sleepDataService from '../../services/sleepDataService';
import { parseISO, format as formatDate } from 'date-fns';
import BedroomForm from '../../components/sleep/BedroomForm';


// Local temperature formatting utility
function formatTemperature(temp, prefersImperial, withUnit = false) {
    if (typeof temp !== 'number') return temp;
    let value = temp;
    let unit = '°F';
    if (!prefersImperial) {
        value = Math.round(((temp - 32) * 5) / 9);
        unit = '°C';
    }
    return withUnit ? `${value}${unit}` : value;
}

// Utility: Convert user date format to date-fns compatible format
function toDateFnsFormat(fmt) {
    if (!fmt) return 'PPP';
    return fmt
        .replace(/Y{2,4}/gi, 'yyyy')
        .replace(/D{2}/g, 'dd')
        .replace(/M{2}/g, 'MM');
}

// Main BedroomDetails component
function BedroomDetails() {
    // Get bedroom id from URL params and navigation function
    const { bedroomid } = useParams();
    const navigate = useNavigate();

    // Get dashboard data and refresh function from context
    const { dashboardData, refreshDashboard } = useContext(DashboardContext);

    // Local state for bedroom details, edit mode, delete password, usage dates, loading, and error
    const [bedroom, setBedroom] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [usageDates, setUsageDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get user preferences for formatting
    const preferences = dashboardData.profile?.userPreferences || {};
    const prefersImperial = preferences.prefersImperial ?? false;
    const dateFormat = toDateFnsFormat(preferences.dateFormat) || 'PPP';

    // Load bedroom data and usage dates on mount or when dependencies change
    useEffect(() => {
        // Debug: log current dashboardData and bedroomid
        console.log('BedroomDetails useEffect:', {
            bedroomid,
            bedrooms: dashboardData?.bedrooms?.map(b => b._id)
        });
        if (!Array.isArray(dashboardData?.bedrooms)) {
            // Wait for bedrooms to load
            setLoading(true);
            return;
        }
        const loadData = async () => {
            try {
                // Find the bedroom in dashboard context by id
                let room = dashboardData.bedrooms.find(
                    b => b._id === bedroomid
                );

                if (!room) {
                    setError('Bedroom not found or you do not have access.');
                    setBedroom(null);
                    return;
                }

                setBedroom(room);

                // Load all sleep sessions (prefer context, fallback to API)
                let allSleepData = dashboardData?.allSleepSessions;
                if (!Array.isArray(allSleepData) || allSleepData.length === 0) {
                    allSleepData = await sleepDataService.getSleepDataByUser();
                }
                if (!Array.isArray(allSleepData)) {
                    allSleepData = [];
                }

                // Filter sleep data for this bedroom and sort by date descending
                const datesUsed = allSleepData
                    .filter(entry => entry.bedroom && (entry.bedroom._id === room._id || entry.bedroom === room._id))
                    .map(entry => ({
                        id: entry._id,
                        date: entry.createdAt,
                    }))
                    .sort((a, b) => new Date(b.date) - new Date(a.date));

                setUsageDates(datesUsed);
                setError(null); // clear error if successful
            } catch (err) {
                console.error('Failed to load bedroom details:', err);
                setError('Failed to load bedroom details.');
                setBedroom(null);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [bedroomid, dashboardData]);

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
    if (loading && !error) {
        return <div>Loading bedroom details...</div>;
    }

    // Show error state
    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard/bedrooms')}>Back to Bedrooms</button>
            </div>
        );
    }

    if (!bedroom) {
        // Defensive: should not happen, but just in case
        return null;
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
                            prefersImperial={prefersImperial}
                            dateFormat={dateFormat}
                        />
                    ) : (
                        <BedroomForm
                            initialData={bedroom}
                            onSubmit={async (data) => {
                                await bedroomService.updateBedroom(bedroom._id, data);
                                setIsEditing(false);
                                refreshDashboard?.();
                            }}
                            onCancel={() => setIsEditing(false)}
                            submitLabel="Save Changes"
                        />
                    )}
                </div>

                {/* Right column: Usage dates and delete option */}
                <div className="col-md-6">
                    <BedroomUsageList
                        usageDates={usageDates}
                        navigate={navigate}
                        dateFormat={dateFormat}
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
function BedroomInfo({ bedroom, onEdit, prefersImperial, dateFormat }) {
    return (
        <div>
            <p><strong>Bed Type:</strong> {bedroom.bedType}</p>
            {bedroom.bedType === 'bed' && (
                <>
                    <p><strong>Mattress:</strong> {bedroom.mattressType}</p>
                    <p><strong>Size:</strong> {bedroom.bedSize}</p>
                </>
            )}
            <p><strong>Temp:</strong> {formatTemperature(bedroom.temperature, prefersImperial, true)}</p>
            <p><strong>Light:</strong> {bedroom.lightLevel}</p>
            <p><strong>Noise:</strong> {bedroom.noiseLevel}</p>
            <p><strong>Pillows:</strong> {bedroom.pillows}</p>
            <p><strong>Notes:</strong> {bedroom.notes || 'None'}</p>
            <p><strong>Last Updated:</strong> {bedroom.lastUpdatedAt ? formatDate(new Date(bedroom.lastUpdatedAt), dateFormat + ' p') : 'N/A'}</p>
            <button className="btn btn-primary me-2" onClick={onEdit}>
                Edit
            </button>
        </div>
    );
}

// Subcomponent: List of sleep sessions in this bedroom
function BedroomUsageList({ usageDates, navigate, dateFormat }) {
    return (
        <>
            <h5 className="mt-3">Sleep Sessions in this Bedroom</h5>
            <p>Total Nights: {usageDates.length}</p>
            <ul className="list-group">
                {usageDates.map(entry => {
                    const dateObj = parseISO(entry.date);
                    return (
                        <li key={entry.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>{formatDate(dateObj, dateFormat)}</span>
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate(`/sleep/${entry.id}`)}
                                title="View this sleep session"
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
