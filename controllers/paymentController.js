import paystack from "../config/paystackConfig.js";

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
