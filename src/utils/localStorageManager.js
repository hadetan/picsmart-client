export const KEY_ACCESS_TOKEN = 'access_token';

// This function will check if the user is logged in
export function getItem(key) {
    return localStorage.getItem(key);
}

export function setItem(key, value) {
    localStorage.setItem(key, value);
}

export function removeItem(key) {
    localStorage.removeItem(key);
}
