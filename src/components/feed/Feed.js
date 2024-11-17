import React from 'react';
import './Feed.scss';
import Post from '../post/Post';
import Follower from '../follower/Follower';

const Feed = () => {
	return (
		<div className='Feed'>
			<div className='container'>
				<div className='left-part'>
					<Post />
					<Post />
					<Post />
					<Post />
					<Post />
					<Post />
				</div>
				<div className='right-part'>
					<div className='following'>
						<h3 className='title'>Followings -</h3>
            <Follower />
            <Follower />
            <Follower />
            <Follower />
            <Follower />
					</div>
          <div className='suggestion'>
						<h3 className='title'>Suggestions -</h3>
            <Follower />
            <Follower />
            <Follower />
            <Follower />
            <Follower />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Feed;
