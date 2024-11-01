import axios from 'axios';
import {
	getITem,
	KEY_ACCESS_TOKEN,
	removeItem,
	setItem,
} from './localStorageManager';
import configs from '../configs/configs';

export const axiosClient = axios.create({
	//We can define our base url here so we will not have to type it again and again.
	baseURL: configs.BASE_URL,
	withCredentials: true, //Helps us to send cookies from frontend to backend.
});

// This will intercept the request
axiosClient.interceptors.request.use((request) => {
	const accessToken = getITem(KEY_ACCESS_TOKEN);
    // Setting up the token inside our request header along with Bearer
	request.headers['Authorization'] = `Bearer ${accessToken}`;

	return request;
});

// This will intercept the response
axiosClient.interceptors.response.use(async (response) => {
	const data = response.data;
    // If the status is ok then everything is fine
	if (data.status === 'ok') {
		return data;
	}

    // Extracting few data from the response and saving it in variable
	const originalRequest = response.config;
	const statusCode = data.statusCode;
	const error = data.message;

	if (
		// When refresh token expires, logout the user completely and send the user back to login page.
		statusCode === 401 &&
		originalRequest.url === `http://localhost4000/v1/auth/refreshtoken`
	) {
		removeItem(KEY_ACCESS_TOKEN);
		window.location.replace('/login', '_self');
		return Promise.reject(error);
	}

    // If the statuscode responds with 401 then we will call the refreshtoken API and then check if the status is ok, because if its not ok then it must be because the refreshtoken has been expired (1 year later), if its ok then set new access token recieved from refreshtoken API.
	if (statusCode === 401) {
		const response = await axiosClient.get('/auth/refreshtoken');
		if (response.status === 'ok') {
			setItem(KEY_ACCESS_TOKEN, response?.result?.accessToken);
			// console.log('response in interceptor', response?.result);
			originalRequest.headers[
				'Authorization'
			] = `Bearer ${response?.result?.accessToken}`;
			return axios(originalRequest);
		}
	}

    // If theres any other type of error, then just reject the promise with the error variable which is holding our error message.
	return Promise.reject(error);
});
