import React, { useRef, useState } from 'react'
import './Navbar.scss'
import Avatar from '../avatar/Avatar'
import { useNavigate } from 'react-router-dom'
import { BiLogOutCircle } from 'react-icons/bi'
import { useDispatch, useSelector } from 'react-redux'

const Navbar = () => {
  const navigate = useNavigate();
  const myProfile = useSelector(state => state.appConfigReducer.myProfile);

  const handleLogout = () => {
              
  }

  return (
    <div className='Navbar'>
        <div className='container'>
            <h2 className='banner hover-link' onClick={() => navigate('/')}>PicsMart</h2>
            <div className='right-side'>
                <div className='profile hover-link' onClick={() => navigate(`/profile/${myProfile?._id}`)}>
                    <Avatar src={myProfile?.avatar?.url} />
                </div>
                {/* Loading */}
                <div className="logout hover-link" onClick={handleLogout}>
                <BiLogOutCircle />
                <p className='logout-text'>logout</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Navbar