import React from 'react'
import { getItem, KEY_ACCESS_TOKEN } from '../utils/localStorageManager'
import { Navigate, Outlet } from 'react-router-dom';

const NotLoggedIn = () => {
    const user = getItem(KEY_ACCESS_TOKEN);

  return (
    <div>
        {user ? <Navigate to="/"/> : <Outlet />}
    </div>
  )
}

export default NotLoggedIn