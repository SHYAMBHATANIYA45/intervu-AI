import { percent } from 'motion/react';
import React from 'react'
import {buildStyles, CircularProgressbar} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
function Timer({timeLeft, totalTime}) {
    // const percentage = ({timeLeft , totalTime})
   
        const percentage = ((timeLeft || 0) / (totalTime || 1)) * 100 ;
    
  return (
    <div className='w-20 h-20'>
        <CircularProgressbar value={percentage}
            text={`${timeLeft}s`}
         value = {percentage}
         styles={buildStyles({
            textSize : "28px",
            pathColor:"#10b981",
            textColor:"#ef4444",
            trailColor:"#e5e7eb"
         })}
         
         />
    
    </div>
  )
}

export default Timer ;