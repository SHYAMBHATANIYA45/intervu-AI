import React, { useEffect } from 'react'
import Home from './pages/Home'

import { Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './Redux/UserSlice'
import InterviewPage from './pages/InterviewPage'
import InterviewHistory from './pages/InterviewHistory'
import Pricing from './pages/Pricing'
import InterviewReport from './pages/InterviewReport'

export const serverUrl = "https://intervu-ai-dnw8.onrender.com" // 8000 port pe run kr rha he
function App() {
  //use to dispatch data 
   const dispatch = useDispatch();
  useEffect(() => {
    
   

    const getUser = async () => {
      try {
        const result = await axios.get(serverUrl + "/api/user/current-user", {
          withCredentials: true,
          
        });

        //dispatch data to our store so we can access it anywhere
        dispatch(setUserData(result.data));
        console.log(result.data);

      } catch (error) {
        console.log(error);
        dispatch(setUserData(null));
      }
    }
    getUser();

  }, [dispatch])

  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/interview" element={<InterviewPage/>}/>
      <Route path="/history" element={<InterviewHistory/>} />
      <Route path="/pricing" element={<Pricing/>}/>
       <Route path="/report/:id" element={<InterviewReport/>}/>
    
     
    </Routes>
  
  )
}

export default App
