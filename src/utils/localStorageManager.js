export const KEY_ACCESS_TOKEN = 'access_token';

// This function will check if the user is logged in
export const getITem = (key) => {
	return localStorage.getItem(key);
};

// This function will save the access token to local storage and then remember that the user is already logged in
export const setItem = (key, value) => {
	return localStorage.setItem(key, value);
};

// This function will log out the user
export const removeItem = (key) => {
	return localStorage.removeItem(key);
};
