import React, { useEffect } from 'react';
import { axiosClient } from '../../utils/axiosClient';
import { getItem, KEY_ACCESS_TOKEN } from '../../utils/localStorageManager';

const Home = () => {
	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
    try {
      console.log(getItem(KEY_ACCESS_TOKEN));
      const response = await axiosClient.post('/post/all');
      console.log('response from backend', response);
    } catch (err) {
        console.log(err);
    }
	};

	return <div>Home</div>;
};

export default Home;
