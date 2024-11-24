import React from 'react';
import './UpdateProfile.scss';
import userImg from '../../assets/imgs/user.png';

const UpdateProfile = () => {
	return (
		<div className='UpdateProfile'>
			<div className='container'>
				<div className='leftPart'>
					<img className='user-img' src={userImg} alt='' />
				</div>
				<div className='rightPart'>
					<form>
						<input type='text' placeholder='Your Name' />
						<input type='text' placeholder='Your Bio' />

						<input type='submit' className='btn-primary' />
					</form>
					<button className='delete-account btn-primary hover-link'>
						Delete Account
					</button>
				</div>
			</div>
		</div>
	);
};

export default UpdateProfile;
