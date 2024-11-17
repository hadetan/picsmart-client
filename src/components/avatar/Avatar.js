import React from 'react'
import userImg from '../../assets/imgs/user.png'
import './Avatar.scss'
import { useNavigate } from 'react-router-dom'

const Avatar = ({src}) => {
  const navigate = useNavigate();
  return (
    <div className='Avatar hover-link' onClick={() => navigate('/profile/123')}>
        <img src={src ? src : userImg} alt='user avatar'/>
    </div>
  )
}

export default Avatar