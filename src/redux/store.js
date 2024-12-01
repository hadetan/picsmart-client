import { configureStore } from "@reduxjs/toolkit";
import appConfigReducer from './slices/appConfigSlice.js'

export default configureStore({
    reducer: {
        appConfigReducer
    }
})