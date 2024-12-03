import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosClient } from '../../utils/axiosClient';

export const getMyInfo = createAsyncThunk(
	'user/getMyInfo',
	async (body, thunkAPI) => {
		try {
			thunkAPI.dispatch(setLoading(true));
			const response = await axiosClient.get('/user/getMyInfo');
			console.log('data fetched', response.result);
			return response.result;
		} catch (err) {
			return Promise.reject(err);
		} finally {
			thunkAPI.dispatch(setLoading(false));
		}
	}
);

export const updateMyProfile = createAsyncThunk(
	'user/updateMyProfile',
	async (body, thunkAPI) => {
		try {
			thunkAPI.dispatch(setLoading(true));
			const response = await axiosClient.put('/user/', body);

			return response.result;
		} catch (err) {
			return Promise.reject(err);
		} finally {
			thunkAPI.dispatch(setLoading(false));
		}
	}
);

const appConfigSlice = createSlice({
	name: 'appConfigSlice',

	initialState: {
		isLoading: false,
		myProfile: {},
	},

	reducers: {
		setLoading: (state, action) => {
			state.isLoading = action.payload;
		},
	},

	extraReducers: (builder) => {
		builder.addCase(getMyInfo.fulfilled, (state, action) => {
			state.myProfile = action.payload?.user;
		}).addCase(updateMyProfile.fulfilled, (state, action) => {
			state.myProfile = action.payload?.user;
		});
	},
});

export default appConfigSlice.reducer;

export const { setLoading } = appConfigSlice.actions;
