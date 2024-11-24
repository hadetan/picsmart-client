import React, { useRef, useState } from 'react'
import './Navbar.scss'
import Avatar from '../avatar/Avatar'
import { useNavigate } from 'react-router-dom'
import { BiLogOutCircle } from 'react-icons/bi'
import LoadingBar from 'react-top-loading-bar'

const Navbar = () => {
  const navigate = useNavigate();
  //Created these for loading
  const loadingRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const toggleLoading = () => {
    if (loading) {
      setLoading(false);
      loadingRef.current.complete();
    } else {
      setLoading(true);
      loadingRef.current.continuousStart();
    }
  }

  return (
    <div className='Navbar'>
      <LoadingBar height={4} color={"var(--accent-color)"} ref={loadingRef}/>
        <div className='container'>
            <h2 className='banner hover-link' onClick={() => navigate('/')}>PicsMart</h2>
            <div className='right-side'>
                <div className='profile hover-link' onClick={() => navigate('/profile/123')}>
                    <Avatar />
                </div>
                {/* Loading */}
                <div className="logout hover-link" onClick={toggleLoading}>
                <BiLogOutCircle />
                <p className='logout-text'>logout</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Navbar