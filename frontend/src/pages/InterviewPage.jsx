import React, { useState } from 'react'
import Step1Setup from '../components/Step1Setup';
import Step2Interview from '../components/Step2Interview';
import Step3Report from '../components/Step3Report';
import InterviewReport from './InterviewReport';

function InterviewPage() {
    const [step ,setStep] =useState(1)
    const [interviewData,setInterviewData] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
{step === 1 && (
   
<Step1Setup onStart={(data)=>{
    //generate question hone ke baad idhr set kr deneg setinterviewDATA me
    setInterviewData(data);
    setStep(2)
}}/>

)}


{step === 2 && (
   
<Step2Interview interviewData={interviewData}
onFinish={(report)=>{
    //report milegi usko is setInterviewData ke andr set kra denge 
    setInterviewData(report)
    setStep(3)
}}/>


)}

{step === 3 && (
   
<Step3Report report={interviewData}/>

)}


        
        </div>
  )
}

export default InterviewPage