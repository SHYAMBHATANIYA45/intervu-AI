import { createSlice } from "@reduxjs/toolkit";


const userSlice = createSlice({
    name : "user",
    initialState :{
        userData : null
    },
    //reducer is use to change update initial state or data
    reducers:{
        setUserData: (state,action)=>{
            state.userData = action.payload
        }
    }
}) 
export const {setUserData} = userSlice.actions
export default userSlice.reducer 