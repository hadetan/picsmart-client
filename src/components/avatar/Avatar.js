import React from 'react'
import userImg from '../../assets/imgs/user.png'
import './Avatar.scss'

const Avatar = ({src}) => {
  return (
    <div className='Avatar hover-link'>
        <img src={src ? src : userImg} alt='user avatar'/>
    </div>
  )
}

export default Avatar