import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosClient } from '../../utils/axiosClient';
import { setLoading } from './appConfigSlice';

export const getUserProfile = createAsyncThunk(
	'user/getUserProfile',
	async (body, thunkAPI) => {
		try {
			thunkAPI.dispatch(setLoading(true));
			const response = await axiosClient.post(
				'/user/getUserProfile',
				body
			);
			console.log('renewed post?', response);
			return response.result;
		} catch (err) {
			return Promise.reject(err);
		} finally {
			thunkAPI.dispatch(setLoading(false));
		}
	}
);

export const likeAndUnlike = createAsyncThunk(
	'post/likeAndUnlike',
	async (body, thunkAPI) => {
		try {
			thunkAPI.dispatch(setLoading(true));
			const response = await axiosClient.post('/post/like', body);
			return response.result.post;
		} catch (err) {
			return Promise.reject(err);
		} finally {
			thunkAPI.dispatch(setLoading(false));
		}
	}
);

const postSlice = createSlice({
	name: 'postSlice',

	initialState: {
		userProfile: {},
	},

	extraReducers: (builder) => {
		builder.addCase(getUserProfile.fulfilled, (state, action) => {
			state.userProfile = action.payload;
		})
		.addCase(likeAndUnlike.fulfilled, (state, action) => {
			const post = action.payload;
			console.log("liked?", post);
			const index = state.userProfile.posts.findIndex(item => item._id === post._id)
			if (index !== -1) {
				state.userProfile.posts[index] = post;
			}
		})
	},
});

export default postSlice.reducer;
