import React from 'react';
import Login from './pages/login/Login';
import { Routes, Route } from 'react-router-dom';
import Signup from './pages/signup/Signup';
import Home from './pages/home/Home';
import RequireUser from './components/RequireUser';

const App = () => {
	return (
		<Routes>
			<Route element={<RequireUser />}>
				<Route path='/' element={<Home />} />
			</Route>

			<Route path='/login' element={<Login />} />
			<Route path='/signup' element={<Signup />} />
		</Routes>
	);
};

export default App;
