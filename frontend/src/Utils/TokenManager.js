// tokenManager.js
import axios from 'axios';

// Function to store the JWT token in local storage
export const storeToken = async (token, refreshToken) => {
    try {
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('jwtRefreshToken', refreshToken);
    } catch (error) {
        // Handle local storage error
        console.log("store token failed: ", error)
    }
};

// Function to store the JWT token in local storage
export const removeToken = async () => {
    try {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('jwtRefreshToken');
    } catch (error) {
        // Handle local storage error
        console.log("remove token failed: ", error)
    }
};

// Function to retrieve the JWT token from local storage
export const getToken = async () => {
    try {
        const token = localStorage.getItem('jwtToken');
        const refreshToken = localStorage.getItem('jwtRefreshToken');
        return {token: token, refreshToken: refreshToken};
    } catch (error) {
        // Handle local storage error
        console.log("get token failed");
        return null;
    }
};

// Function to refresh the JWT token
const refreshAuthToken = async (refreshToken) => {
    try {
        // First, obtain the CSRF token
        const csrfResponse = await axios.get('/api/get-csrf-token/');
        const csrfToken = csrfResponse.data.csrfToken;

        // Create custom headers with the refresh token and CSRF token
        const customHeaders = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        };

        // Create the request data
        const postData = {
            refresh: refreshToken,
        };

        // Send the POST request to refresh the token
        const response = await axios.post('/api/token/refresh/', postData, {
            headers: customHeaders,
        });

        // Handle the response data here
        console.log("refreshed token: ", response.data.access);
        const newAccessToken = response.data.access;

        // Store the new access token and refresh token (if needed)
        storeToken(newAccessToken, refreshToken);

        return newAccessToken; // Return the new access token
    } catch (error) {
        // Handle token refresh failure
        console.error(error);
        throw error;
    }
};

const isTokenAboutToExpire = (token) => {
    try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            return true; // Token is invalid or expired (err on the side of caution)
        }

        const payload = JSON.parse(atob(tokenParts[1])); // Decode and parse the payload

        if (!payload.exp) {
            return true; // Token doesn't have an expiration time (err on the side of caution)
        }

        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        console.log("expiration time: ", expirationTime);
        const currentTime = Date.now();
        const threshold = 1 * 60 * 1000; // 1 minutes (adjust as needed)
        console.log("remaining time: ", expirationTime - currentTime);
        console.log("threshold: ", threshold);

        return expirationTime - currentTime < threshold;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true; // Handle decoding error as expired (err on the side of caution)
    }
};

// Function to refresh the token
export const checkAuthToken = async () => {
    const {token, refreshToken} = await getToken();

    if (token && isTokenAboutToExpire(token)) {
        return refreshAuthToken(refreshToken);
    }
    else return token;
};
