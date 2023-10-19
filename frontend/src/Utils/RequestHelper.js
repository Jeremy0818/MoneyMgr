import axios from 'axios';
import { getToken, storeToken, removeToken, checkAuthToken } from './TokenManager';

export const getUserInfo = async () => {
    try {
        // First, obtain the CSRF token
        const csrfResponse = await axios.get('/api/get-csrf-token/');
        const csrfToken = csrfResponse.data.csrfToken;

        const { token, refreshToken } = await getToken();

        // Create custom headers with the refresh token and CSRF token
        const customHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        };

        // Send the POST request to refresh the token
        const response = await axios.get('/api/get-user/', {
            headers: customHeaders,
        });

        // Handle the response data here
        console.log(response.data.user);

        return response.data.user; // Return the new access token
    } catch (error) {
        // Handle token refresh failure
        console.error(error);
        throw error;
    }
};

export const uploadImage = async (image) => {
    try {
        const formData = new FormData();
        // Add the captured image data to the form data
        formData.append('image', image);

        // First, obtain the CSRF token
        const csrfResponse = await axios.get('/api/get-csrf-token/');
        const csrfToken = csrfResponse.data.csrfToken;

        const { token, refreshToken } = await getToken();

        // Create custom headers with the refresh token and CSRF token
        const customHeaders = {
            'Authorization': `Bearer ${token}`,
            'X-CSRFToken': csrfToken,
        };

        const response = await axios.post('/api/ocr/', formData, {
            headers: customHeaders,
        });
        const data = response.data;

        if (data.error) {
            console.log(data.error);
            return { data: null, error: data.error };
        }

        return { data: data, error: null };
    } catch (error) {
        console.error('Error:', error);
        return { data: null, error: error };
    }
}

export const saveTransactions = async (transactions) => {
    try {
        // First, obtain the CSRF token
        const csrfResponse = await axios.get('/api/get-csrf-token/');
        const csrfToken = csrfResponse.data.csrfToken;

        const { token, refreshToken } = await getToken();

        // Create custom headers with the refresh token and CSRF token
        const customHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        };

        const response = await axios.post('/api/transaction/', transactions, {
            headers: customHeaders,
        });
        
        const data = response.data;

        if (data.error) {
            console.log(data.error);
            return { data: null, error: data.error };
        }

        return { data: data, error: null };
    } catch (error) {
        console.error('Error:', error);
        return;
    }
}

export const getAccountBalance = async () => {
    try {
        // First, obtain the CSRF token
        const csrfResponse = await axios.get('/api/get-csrf-token/');
        const csrfToken = csrfResponse.data.csrfToken;

        const { token, refreshToken } = await getToken();

        // Create custom headers with the refresh token and CSRF token
        const customHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        };

        const response = await axios.get('/api/account/', {
            headers: customHeaders,
        });
        
        const data = response.data;

        if (data.error) {
            console.log(data.error);
            return { data: null, error: data.error };
        }

        return { data: data, error: null };
    } catch (error) {
        console.error('Error:', error);
        return;
    }
}