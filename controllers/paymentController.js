import { paystack } from "../config/paystackConfig.js";

export const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const response = await paystack.get(`/transaction/verify/${reference}`);
    res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    next(err);
  }
};