import React, { useEffect } from 'react';
import { axiosClient } from '../../utils/axiosClient';
import { getItem, KEY_ACCESS_TOKEN } from '../../utils/localStorageManager';
import Navbar from '../../components/navbar/Navbar';
import Feed from '../../components/feed/Feed';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMyInfo } from '../../redux/slices/appConfigSlice';

const Home = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMyInfo());
  }, [])
	return <>
    <Navbar />
    <Outlet />
  </>;
};

export default Home;
