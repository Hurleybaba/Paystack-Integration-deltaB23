import crypto from "crypto";

export const validateSignature = (req, res, next) => {
  const signature = req.headers["x-paystack-signature"];
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== signature) {
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }
  next();
};