import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import paystack from "../config/paystackConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const response = await paystack.get(`/transaction/verify/${reference}`);

    console.log("Paystack verify response:", response.data);

    res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    next(err);
  }
};

export const initializePayment = async (req, res, next) => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount)
      return res
        .status(400)
        .json({ success: false, message: "Email and amount are required" });

    const response = await paystack.post("/transaction/initialize", {
      email,
      amount: amount * 100, // Convert to kobo
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    console.error("Paystack init error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Error initializing payment",
      error: err.response?.data || err.message,
    });
  }
};

export const listTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const response = await paystack.get(`/transaction?perPage=${limit}&page=${page}`);
    console.log("Paystack list transactions response:", response.data);
    res.status(200).json({
      success: true,
      data: response.data.data, // array of transactions
      meta: {
        page: response.data.meta.page,
        pageCount: response.data.meta.pageCount,
        total: response.data.meta.total,
        next: response.data.meta.next,
        previous: response.data.meta.previous,
      },
    });
  } catch (err) {
    next(err);
  }
};
