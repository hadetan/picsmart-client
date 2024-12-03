import axios from 'axios';
import {
	getItem,
	KEY_ACCESS_TOKEN,
	removeItem,
	setItem,
} from './localStorageManager';

export const axiosClient = axios.create({
	//We can define our base url here so we will not have to type it again and again.
	baseURL: `http://localhost:4000/v1`,
	withCredentials: true, //Helps us to send cookies from frontend to backend.
});

// This will intercept the request
axiosClient.interceptors.request.use((request) => {
	const accessToken = getItem(KEY_ACCESS_TOKEN);
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
	const errorMessage = data.message;

	// if (
	// 	// When refresh token expires, logout the user completely and send the user back to login page.
	// 	statusCode === 401 &&
	// 	originalRequest.url === `http://localhost:4000/v1/auth/refreshtoken`
	// ) {
	// 	removeItem(KEY_ACCESS_TOKEN);
	// 	window.location.replace('/login', '_self');
	// 	return Promise.reject(errorMessage);
	// }

	// If the statuscode responds with 401 then we will call the refreshtoken API and then check if the status is ok, because if its not ok then it must be because the refreshtoken has been expired (1 year later), if its ok then set new access token recieved from refreshtoken API.
	if (statusCode === 401 && !originalRequest._retry) {
		originalRequest._retry = true;
		// const response = await axios.post(`${configs.BASE_URL}/auth/refreshtoken`);
		const response = await axios
			.create({
				withCredentials: true,
				baseURL: 'http://localhost:4000/v1',
			})
			.post('/auth/refreshtoken');

		if (response.data.status === 'ok') {
			setItem(KEY_ACCESS_TOKEN, response.data.result.accessToken);
			originalRequest.headers[
				'Authorization'
			] = `Bearer ${response.data.result.accessToken}`;
			return axios(originalRequest);
		} else {
			removeItem(KEY_ACCESS_TOKEN);
			window.location.replace('/login', '_self');
			return Promise.reject(errorMessage);
		}
	}
	
	// If theres any other type of error, then just reject the promise with the error variable which is holding our error message.
	return Promise.reject(errorMessage);
}, async (err) => {
	console.log(err);
});
