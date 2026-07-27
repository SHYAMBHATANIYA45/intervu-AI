
import crypto from "crypto";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js";

const plans = {
    starter: { amount: 99, credits: 150 },
    pro: { amount: 500, credits: 650 },
};

export const createOrder = async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = plans[planId];

        if (!plan) {
            return res.status(400).json({ message: "Invalid plan data" });
        }

        const options = {
            amount: plan.amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        await Payment.create({
            userId: req.userId,
            planId,
            amount: plan.amount,
            credits: plan.credits,
            razorpayOrderId: order.id,
            status: "created",
        });

        return res.json(order);
    } catch (error) {
        console.error("Failed to create Razorpay order:", error);
        return res.status(500).json({ message: "Unable to create payment order" });
    }
}

export const verifyPayment = async (req, res) => {

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");


        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (payment.status === "paid") {
            return res.json({ message: "Already processed" });
        }

        payment.status = "paid";
        payment.razorpayPaymentId = razorpay_payment_id;
        await payment.save();

        const updateUser = await User.findByIdAndUpdate(payment.userId, {
            $inc: { credit: payment.credits }
        }, { new: true });

    return res.json({
            success: true,
            message: "Payment verified and credits added",
            user: updateUser,
        });

    } catch (error) {
        console.error("Failed to verify Razorpay payment:", error);
        return res.status(500).json({ message: "Unable to verify payment" });
    }

}
