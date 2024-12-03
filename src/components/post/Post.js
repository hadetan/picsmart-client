import React from 'react';
import Avatar from '../avatar/Avatar.js';
import './Post.scss';
import { IoIosHeartEmpty, IoMdHeart } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import { likeAndUnlike } from '../../redux/slices/postSlice.js';

const Post = ({ post }) => {
	const dispatch = useDispatch();
	const handlePostLike = async () => {
		dispatch(
			likeAndUnlike({
				postId: post?._id,
			})
		);
	};
	return (
		<div className='Post'>
			<div className='heading'>
				<Avatar src={post?.owner?.avatar?.url} />
				<h4>{post?.owner?.name}</h4>
			</div>
			<div className='content'>
				<img
					src={
						post?.image?.url ||
						'https://plus.unsplash.com/premium_photo-1673292293042-cafd9c8a3ab3?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
					}
					alt={post?.owner?.name}
				/>
			</div>
			<div className='footer'>
				<div className='like' onClick={handlePostLike}>
					{post?.isLiked ? (
						<IoMdHeart className='hover-link heart' />
					) : (
						<IoIosHeartEmpty className='hover-link icon' />
					)}
					<h4>{post?.likesCount} likes</h4>
				</div>
				<p className='caption'>{post?.caption}</p>
				<h6 className='time'>{post?.timeAgo}</h6>
			</div>
		</div>
	);
};

export default Post;
