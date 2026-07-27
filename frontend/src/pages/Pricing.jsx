import React, { useState } from 'react'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react"
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../Redux/UserSlice'

function Pricing() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [selectedPlan, setSelectedPlan] = useState("free")
    const [loadingPlan, setLoadingPlan] = useState();
    const plans = [
        {
            id: "free",
            name: "Free",
            price: "₹0",
            credits: 100,
            description: "Perfect for beginners starting interview preparation.",
            features: [
                "100 AI Interview Credits",
                "Basic Performance Report",
                "Voice AI Interview",
                "Limited Interview History",
                "Community Support"
            ],

            default: true,
        },

        {
            id: "starter",
            name: "Starter Pack",
            price: "₹99",
            credits: 150,
            description: "Ideal for students preparing for placements.",
            features: [
                "150 AI Interview Credits",
                "Detailed Performance Report",
                "Voice AI Interview",
                "Unlimited Interview History",
                "Priority AI Support"
            ],

        },

        {
            id: "pro",
            name: "Pro Pack",
            price: "₹500",
            credits: 650,
            description: "Best for serious job seekers and professionals.",
            features: [
                "650 AI Interview Credits",
                "Advanced AI Feedback",
                "Unlimited Voice Interviews",
                "Unlimited Interview History",

                "Priority Support"
            ],
            badge: "Best Value"

        }
    ];

    const handlePayment = async (plan) => {

        try {
            setLoadingPlan(plan.id);
            const result = await axios.post(
                serverUrl + "/api/payment/order",
                { planId: plan.id },
                { withCredentials: true }
            );

            if (!window.Razorpay) {
                throw new Error("Razorpay checkout failed to load. Please refresh and try again.");
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: result.data.amount,
                currency: result.data.currency,
                name: "InterviewIQ.AI",
                description: `${plan.name} -${plan.credits} Credits`,
                order_id: result.data.id,

                handler: async (response) => {
                    try {
                        console.log("Razorpay payment successful:", response);
                        const verification = await axios.post(
                            serverUrl + "/api/payment/verify",
                            response,
                            { withCredentials: true }
                        );
                        console.log("Payment verified and credits added:", verification.data);
                        dispatch(setUserData(verification.data.user));
                        alert("Payment confirmed. Your credits have been added.");
                        navigate("/");
                    } catch (error) {
                        alert(error.response?.data?.message || "Payment verification failed. Please contact support.");
                    } finally {
                        setLoadingPlan(null);
                    }
                },
                theme: {
                    color: "#059669"
                },
                modal: {
                    ondismiss: () => setLoadingPlan(null),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error(error)
            alert(error.response?.data?.message || error.message || "Unable to start payment.");
            setLoadingPlan(null);
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-emerald-5 py-16 px-6'>
            <div className="max-w-6xl mx-auto mb-14 flex items-start gap-4">
                <button
                    onClick={() => navigate("/")}
                    className='mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
                    <FaArrowLeft className='text-gray-600'></FaArrowLeft>
                </button>

                <div className="text-center w-full ">
                    <h1 className='text-4xl font-bold text-gray-800'>
                        Choose Your Plan
                    </h1>
                    <p className='text-gray-500 mt-3 text-lg'>
                        Flexible pricing to match your interview preparation goals.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto" >

                {
                    plans.map((plan, index) => {
                        const isSelected = selectedPlan === plan.id
                        return (
                            <motion.div
                                key={plan.id}
                                whileHover={!plan.default ? { scale: 1.03 } : {}}
                                onClick={() => !plan.default && setSelectedPlan(plan.id)}
                                className={`relative rounded-3xl p-8 transition-all duration-300 border
                                                  ${isSelected
                                        ? "border-emerald-600 shadow-2xl bg-white"
                                        : "border-gray-200 bg-white shadow-md"
                                    }
                                        ${plan.default ? "cursor-default" : "cursor-pointer"}
  `}
                            >
                                {/* Card Content */}

                                {
                                    plan.badge && (
                                        <div className='absolute right-6 bg-emerald-600 text-white text-xs px-4 py-1 rounded-full shadow'>
                                            {plan.badge}
                                        </div>
                                    )
                                }

                                {plan.default && (
                                    <div className="absolute top-6 right-6 bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full ">
                                        Default
                                    </div>
                                )}


                                {/* plan name */}

                                <h3 className='text-xl font-semibold text-gray-800'>
                                    {plan.name}
                                </h3>

                                {/* price */}
                                <div className='mt-4'>
                                    <span className='text-3xl font-bold text-emerald-600'>
                                        {plan.price}
                                    </span>

                                    <p className='text-gray-500 mt-1'>
                                        {plan.credits} Credits
                                    </p>
                                </div>

                                {/* {description} */}

                                <p className='text-gray-500 mt-4 text-sm leading-relaxed'>
                                    {plan.description}
                                </p>

                                {/* features */}

                                <div className="mt-6 space-y-3 text-left">

                                    {plan.features.map((features, i) => (
                                        <div key={i} className="flex items-center gap-3">

                                            <FaCheckCircle className='text-emerald-500 text-sm'></FaCheckCircle>
                                            <span className='text-gray-700 text-sm'>
                                                {features}
                                            </span>

                                        </div>
                                    ))}
                                </div>

                                {!plan.default &&
                                    <button
                                        disabled={loadingPlan === plan.id}
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            if (!isSelected) {
                                                setSelectedPlan(plan.id)
                                            } else {
                                                handlePayment(plan);
                                            }
                                        }
                                        }
                                        className={`w-full mt-8 py-3 rounded-xl font-semibold transition ${isSelected ? "bg-emerald-600 text-white hover:opacity-90"
                                            : "bg-gray-100 text-gray-700 hover:bg-emerald-50"
                                            }`}>
                                        {
                                            loadingPlan === plan.id ? "Processing..." :
                                                isSelected ? "Proceed to pay" : "Select Plan"}

                                    </button>}


                            </motion.div>
                        )
                    })
                }
            </div>

        </div>
    )
}

export default Pricing
