import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import BigActionButton from './shared/BigActionButton';

/**
 * About component displays information about the DreamWeaver app,
 * including usage instructions, FAQ, and project links.
 * It also shows different actions depending on user authentication state.
 */
function About() {
    // Get user authentication state
    const { user } = useContext(UserContext);

    return (
        <div className="container my-4">
            {/* App Description */}
            <h2>About DreamWeaver</h2>
            <p>
                DreamWeaver is a mindfulness and self-accountability app designed to help you improve your sleep through data-driven insights.
                If you struggle with falling asleep or staying asleep, DreamWeaver offers tools to track your sleep patterns and develop healthier bedtime habits.
            </p>
            <p>
                Once you’re set up, simply press the <strong>Go To Bed</strong> button as a personal commitment to put your phone down and prepare for restful sleep.
                The app tracks your sleep journey and lets you reflect with a journaling feature—where you can plan your dreams or capture sleepy thoughts to revisit later.
            </p>
            <p>
                Please note: DreamWeaver is not a medical device and does not provide medical advice. For issues like snoring, sleep apnea, or chronic insomnia,
                consult a healthcare professional or undergo a sleep study.
            </p>
            <p>
                Pro tip: Add DreamWeaver to your phone’s home screen for quick access. Open your browser’s menu and tap ‘Add to Home Screen.’
            </p>

            {/* FAQ Section */}
            <h3 className="mt-4">How To / FAQ</h3>
            <ul>
                <li>
                    <strong>How do I start tracking my sleep?</strong> Click <em>Go To Bed</em> from the dashboard or navigation bar when you're ready to wind down.
                </li>
                <li>
                    <strong>What happens when I wake up?</strong> Click <em>Wake Up</em> to log your rest and reflect on your dreams or restfulness.
                </li>
                <li>
                    <strong>What are Bedrooms?</strong> These are profiles of your real sleeping environments. Track how light, noise, and temperature affect your rest.
                </li>
                <li>
                    <strong>Can I view past sessions?</strong> Yes, go to Sleep History or Dream Journal to browse your sessions by date and see full details.
                </li>
                <li>
                    <strong>What if I forget to wake up?</strong> No worries! You can set a retroactive wake-up time when you return, use the "Quick Wake-Up" button for instant closure, or check out our reminder tips below.
                </li>
                <li>
                    <strong>Are my preferences saved?</strong> Yes. You can adjust theme, units, and date/time format anytime in your Profile settings.
                </li>
            </ul>

            {/* Sleep Reminders & Tips */}
            <h3 className="mt-4">Never Forget to Wake Up 💡</h3>
            <p>
                Forgot to close a sleep session after waking up? No problem! DreamWeaver makes it easy to handle these situations:
            </p>
            <div className="row">
                <div className="col-md-6">
                    <h5>⏰ Quick Recovery</h5>
                    <ul>
                        <li><strong>Retroactive Wake-Up:</strong> When you return to close a session, you can set your actual wake-up time instead of "now"</li>
                        <li><strong>Quick Wake-Up:</strong> In a hurry? Use the "Quick Wake-Up" button to close the session instantly</li>
                        <li><strong>Smart Suggestions:</strong> For long sessions (12+ hours), the app will suggest setting a retroactive time</li>
                    </ul>
                </div>
                <div className="col-md-6">
                    <h5>📱 Set Up Reminders</h5>
                    <ul>
                        <li><strong>Phone Alarm:</strong> Set a recurring alarm for your usual wake-up time with the note "Close DreamWeaver session"</li>
                        <li><strong>Calendar Event:</strong> Create a daily reminder that links directly to your wake-up page</li>
                        <li><strong>Browser Bookmark:</strong> Save <code>/dashboard</code> to your bookmarks bar for one-click access</li>
                        <li><strong>Home Screen:</strong> Add DreamWeaver to your phone's home screen for instant access</li>
                    </ul>
                </div>
            </div>
            <div className="alert alert-light mt-3" role="alert">
                <strong>💡 Pro Tip:</strong> Create a calendar event that repeats daily at your wake-up time. 
                In the event description, add a link to <code>{window.location.origin}/dashboard</code> so you can jump straight to closing your session!
            </div>

            {/* Important Disclaimer */}
            <div className="alert alert-info mt-4" role="alert">
                <h5 className="alert-heading">⚠️ Important Medical Disclaimer</h5>
                <p className="mb-0">
                    <strong>This app is not medical advice.</strong> DreamWeaver is designed for personal tracking and mindfulness purposes only. 
                    If you have sleep disorders, chronic insomnia, or other sleep-related health concerns, please consult with a qualified healthcare professional.
                </p>
            </div>

            {/* Project Links */}
            <h3 className="mt-4">Project Info</h3>
            <p>
                DreamWeaver is open source! Explore the code and documentation:
            </p>
            <ul>
                <li>
                    <a
                        href="https://github.com/macfarley/dream-weaver"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub Repo
                    </a>
                </li>
                <li>
                    <a
                        href="https://github.com/macfarley/dream-weaver-frontend/blob/main/README.md"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Frontend README
                    </a>
                </li>
                <li>
                    <a
                        href="https://github.com/macfarley/dream-weaver-backend/blob/main/README.md"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Backend README
                    </a>
                </li>
            </ul>

            {/* Authenticated User Actions */}
            {user ? (
                <>
                    <h3 className="mt-4">You're Signed In</h3>
                    <p>Ready for sleep? Head to your dashboard or use the quick action below.</p>
                    <div className="d-flex justify-content-center my-4">
                        <BigActionButton size="medium" />
                    </div>
                </>
            ) : (
                // Unauthenticated User Actions
                <>
                    <h3 className="mt-4">Ready to Get Started?</h3>
                    <p>Sign up or log in to begin your DreamWeaver journey:</p>
                    <div className="d-flex justify-content-center gap-3">
                        <Link className="btn btn-outline-primary btn-lg" to="/signup">
                            Sign Up
                        </Link>
                        <Link className="btn btn-outline-secondary btn-lg" to="/login">
                            Sign In
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

// Export at the bottom for clarity
export default About;
