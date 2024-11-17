import React from 'react';
import Avatar from '../avatar/Avatar.js';
import './Post.scss';
import { IoIosHeartEmpty, IoMdHeart } from 'react-icons/io';

const Post = ({ post }) => {
	return (
		<div className='Post'>
			<div className='heading'>
				<Avatar />
				<h4>Aquib</h4>
			</div>
			<div className='content'>
				<img
					src='https://plus.unsplash.com/premium_photo-1673292293042-cafd9c8a3ab3?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
					alt=''
				/>
			</div>
			<div className='footer'>
				<div className='like'>
					{false ? (
						<IoMdHeart className='hover-link heart' />
					) : (
						<IoIosHeartEmpty className='hover-link icon' />
					)}
					<h4>4 likes</h4>
				</div>
				<p className='caption'>This is nature picture</p>
				<h6 className='time'>4 hours ago</h6>
			</div>
		</div>
	);
};

export default Post;
