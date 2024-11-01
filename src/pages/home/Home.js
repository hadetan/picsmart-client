import React, { useEffect } from 'react'
import { axiosClient } from '../../utils/axiosClient';

const Home = () => {
  
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const response = await axiosClient.get('/post/all');
        console.log('response from backend', response);
        
    }

  return (
    <div>Home</div>
  )
}

export default Home