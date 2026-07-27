import React, { use, useEffect, useRef, useState } from 'react'
import maleVideo from "../assets/video/male-ai.mp4"
import femaleVideo from "../assets/video/female-ai.mp4"
import Timer from './Timer';
import { scale, time } from 'motion/react';
import { motion } from 'motion/react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { current } from '@reduxjs/toolkit';
import { linkWithCredential, updateCurrentUser } from 'firebase/auth';
import axios from "axios"
import { serverUrl } from '../App';
import { BsArrowLeft } from 'react-icons/bs';


function Step2Interview({ interviewData, onFinish }) {


    if (!interviewData) {
        return <div>Loading...</div>;
    }

    const { interviewId, questions, userName } = interviewData;


    const [isIntroPhase, setIsIntroPhase] = useState(true);

    const [isMicOn, setIsMicOn] = useState(true);
    const recognitionRef = useRef(null);
    const [isAiPlaying, setIsAIPlaying] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0)
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedBack] = useState("");
    const [timeLeft, setTimeLeft] = useState(
        questions[0]?.timeLimit || 60
    );
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voiceGender, setVoiceGender] = useState("female");
    const [subtitle, setSubtitle] = useState("");

    const videoRef = useRef(null);

    const currentQuestion = questions[currentIndex]

    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();

            if (!voices.length) return;

            const femaleVoice = voices.find(
                (v) =>
                    v.name.toLowerCase().includes("zira") ||
                    v.name.toLowerCase().includes("samantha") ||
                    v.name.toLowerCase().includes("female")
            );

            if (femaleVoice) {
                setSelectedVoice(femaleVoice);
                setVoiceGender("female");
                return;
            }

            //try know male voices
            const maleVoices = voices.find(v =>
                v.name.toLowerCase().includes("david") ||
                v.name.toLowerCase().includes("mark") ||
                v.name.toLowerCase().includes("male")
            )

            if (maleVoices) {
                setSelectedVoice(maleVoices);
                setVoiceGender("male");
                return;
            }

        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices

    }, [])

    const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;



    // ----- speak Function -----

    const speakText = (text) => {
        return new Promise((resolve) => {
            if (!window.speechSynthesis || !selectedVoice) {
                resolve();
                return;
            }

            window.speechSynthesis.cancel();

            //Add natural pauses after comas and periods
            const humanText = text
                .replace(/,/g, ", ...")
                .replace(/\./g, ". ...");

            const utterance = new SpeechSynthesisUtterance(humanText);

            utterance.voice = selectedVoice;

            //human like pacing
            utterance.rate = 0.92; //slightly slower than normal
            utterance.pitch = 1.05; //small warmth
            utterance.volume = 1

            utterance.onstart = () => {
                setIsAIPlaying(true);

                //mic off
                stopMic();
                videoRef.current?.play();
            };

            utterance.onend = () => {
                videoRef.current?.pause();
                videoRef.current.currentTime = 0;
                setIsAIPlaying(false);

                //micOn
                if (isMicOn) {
                    startMic();
                }

                setSubtitle("");
                resolve();
            };
            setSubtitle(text);
            window.speechSynthesis.speak(utterance);
        });
    };


    useEffect(() => {
        if (!selectedVoice) return;

        const runIntro = async () => {

            if (isIntroPhase) {

                await speakText(
                    `Hi ${userName}, it's great to meet you today.`
                );

                await speakText(
                    `I'll ask you a few questions. Let's begin.`
                );

                setSubtitle("");
                setIsIntroPhase(false);
                return;
            }

            if (currentQuestion) {

                await new Promise(resolve =>
                    setTimeout(resolve, 800)
                );

                if (currentIndex === questions.length - 1) {
                    await speakText(
                        "Alright, this one might be a bit more challenging."
                    );
                }

                await speakText(currentQuestion.question);
            }
        };

        runIntro();

    }, [selectedVoice, isIntroPhase]);


    useEffect(() => {
        if (currentQuestion) {
            setTimeLeft(currentQuestion.timeLimit || 60);
        }
    }, [currentIndex]);


    useEffect(() => {
        if (isIntroPhase) return;
        if (!currentQuestion) return;
        if (isSubmitting) return;
        const timer = setInterval(() => {

            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isIntroPhase, currentIndex, isSubmitting]);


    useEffect(() => {

        if (!("webkitSpeechRecognition" in window)) return;

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuos = true;
        recognition.interimResult = false;
        recognition.onresult = (event) => {
            const transcript =
                event.results[event.results.length - 1][0].transcript;

            setAnswer((prev) => prev + " " + transcript);
        };
        recognitionRef.current = recognition;

    }, [])

    const startMic = () => {
        if (recognitionRef.current && !isAiPlaying) {
            try {
                recognitionRef.current.start();
            } catch {

            }
        }
    };

    const stopMic = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const toggleMic = () => {
        if (isMicOn) {
            stopMic();
        } else {
            startMic();
        }
        setIsMicOn(!isMicOn);
    };

    const submitAnswer = async () => {
        if (isSubmitting) return;
        stopMic();
        setIsSubmitting(true);

        try {
            const result = await axios.post(serverUrl + "/api/interview/submit-answer", {
                interviewId,
                questionIndex: currentIndex,
                answer,
                timeTaken:
                    currentQuestion.timeLimit - timeLeft,

            }, { withCredentials: true });
            setFeedBack(result.data.feedback);
            speakText(result.data.feedback);
            setIsSubmitting(false)
        } catch (error) {
            setIsSubmitting(false);
            console.log(error);

        }
    }

    
    const finishInterview = async (params) => {
        stopMic()
        setIsMicOn(false)
        try {
            const result = await axios.post(serverUrl + "/api/interview/finish", { interviewId }, { withCredentials: true })
            console.log(result.data);
            onFinish(result.data);

        } catch (error) {
            console.log(error);
        }
    }

    const handleNext = async () => {

        setAnswer("");
        setFeedBack("");

        if (currentIndex + 1 >= questions.length) {
           finishInterview();
            return
        }

        await speakText("Alrigth ,let's move to the next question.");
        setCurrentIndex(currentIndex + 1);
        setTimeout(() => {
            if (isMicOn) startMic();
        }, 500);


    }

    useEffect(() => {
        if (isIntroPhase) return;
        if (!currentQuestion) return;
        if (timeLeft === 0 && !isSubmitting && !feedback) {
            submitAnswer();
        }
    }, [timeLeft]);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current.abort();
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    return (

        <div className='min-h-screen bg-linear-to-br from-emerald-100 via-white to-teal-100 flex items-center justify-center p-6 sm:p-6'>
            <div className='w-full max-w-[1400px] min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'>

                {/* video section */}
                <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
                    <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">

                        <video
                            src={videoSource}
                            key={videoSource}
                            ref={videoRef}
                            muted
                            playsInline
                            preload='auto'

                            className='w-full h-auto object-cover'
                        ></video>
                    </div>

                    {/* {subtitle pending} */}
                    {subtitle && (
                        <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm ">
                            <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>

                        </div>
                    )

                    }
                    {/* timer area */}

                    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
                        <div className='flex justify-between items-center'>
                            <span className='text-sm text-gray-500'>
                                Interview Status
                            </span>

                            <span className='text-sm font-semibold text-emerald-600'>
                                AI speaking
                            </span>
                        </div>

                        <div className="h-px bg-gray-200"></div>
                        <div className="flex justify-center">
                            <Timer
                                timeLeft={timeLeft}
                                totalTime={currentQuestion?.timeLimit || 60}
                            />
                        </div>
                        <div className="h-px bg-gray-200"></div>
                        <div className="grid grid-cols-2 gap-6 text-center">
                            <div>
                                <span className='text-2xl font-bold text-emerald-600'>
                                    {currentIndex + 1}
                                </span>
                                <span className='text-xs text-gray-400'> Current Question</span>
                            </div>
                            <div>
                                <span className='text-2xl font-bold text-emerald-600'>
                                    {questions.length}
                                </span>
                                <span className='text-xs text-gray-400'> Total Questions</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* text section */}

                <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">
                    <h2 className='text-xl sm:text-2xl font-bold text-emerald-600 mb-6'>
                        AI Smart Interview
                    </h2>

                    {!isIntroPhase && <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <p className='text-xs sm:text-sm text-gray-400 mb-2'>
                            Question {currentIndex + 1} of {questions.length}
                        </p>

                        <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed pr-16' > {currentQuestion?.question}</div>
                    </div>
                    }

                    <textarea
                        placeholder='Type your anser here...'
                        onChange={(e) =>
                            setAnswer(e.target.value)
                        }
                        value={answer}
                        className='flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800'
                    ></textarea>

                    {!feedback ? (<div className="flex items-center gap-4 mt-6">

                        <motion.button
                            onClick={toggleMic}
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg"
                        >
                            {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
                        </motion.button>

                        <motion.button

                            onClick={submitAnswer}
                            disabled={isSubmitting}
                            whileTap={{ scale: 0.95 }}
                            className='flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disable: bg-gray-500'>
                            {isSubmitting ? "Submitting..." : "Submit Answer"}
                        </motion.button>

                    </div>) : (
                        <motion.div

                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className='mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm'>

                            <p className='text-emerald-700 font-medium mb-4'>{feedback}</p>

                            <button
                                onClick={handleNext}
                                className='w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1'>

                                Next Question <BsArrowLeft size={18} />
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Step2Interview