import { configureStore } from "@reduxjs/toolkit";
import appConfigReducer from './slices/appConfigSlice.js'
import postReducer from './slices/postSlice.js'

export default configureStore({
    reducer: {
        appConfigReducer,
        postReducer,
    }
})