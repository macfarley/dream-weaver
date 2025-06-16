const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/auth`;

// Decode JWT payload safely
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// Get stored JWT token
function getToken() {
  return localStorage.getItem('token');
}

// Remove token from storage
function logOut() {
  localStorage.removeItem('token');
}

// Handle server response for auth
async function handleAuthResponse(res) {
  const data = await res.json();
  if (data.err) throw new Error(data.err);
  if (data.token) {
    localStorage.setItem('token', data.token);
    return decodeToken(data.token);
  }
  throw new Error('Invalid response from server');
}

// Sign up user
async function signUp(formData) {
  try {
    const res = await fetch(`${BASE_URL}/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return await handleAuthResponse(res);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Sign in user
async function signIn(formData) {
  try {
    const res = await fetch(`${BASE_URL}/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return await handleAuthResponse(res);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export {
  signUp,
  signIn,
  getToken,
  decodeToken,
  logOut,
};
