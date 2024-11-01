import React from 'react';
import { getITem, KEY_ACCESS_TOKEN } from '../utils/localStorageManager';
import { Navigate, Outlet } from 'react-router-dom';

const RequireUser = () => {
	const user = getITem(KEY_ACCESS_TOKEN);
	return user ? <Outlet /> : <Navigate to='/login' />;
};

export default RequireUser;
