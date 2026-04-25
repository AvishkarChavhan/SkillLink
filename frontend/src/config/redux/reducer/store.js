/**
 * Steps for state management
 * submit action
 * handle actions and its reducer 
 * register here ->reducer
 * 
 * C:\SkillLink\frontend\src\config\redux\reducer\authReducer\index.jsx
 */


import authReducer from "../reducer/authReducer";
import postReducer from "../reducer/postReducer";
import {configureStore} from "@reduxjs/toolkit";



export const store=configureStore({
    reducer:{
        auth:authReducer,
        postReducer:postReducer
    }
})