 import express from "express";
import crypto from "crypto";

const router = express.Router();

// Paystack webhook endpoint
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(req.body)
    .digest("hex");

  if (hash === req.headers["x-paystack-signature"]) {
    const event = JSON.parse(req.body);

    console.log("✅ Webhook received:", event.event);

    // Handle different events
    switch (event.event) {
      case "subscription.create":
        console.log("New subscription created");
        // Save subscription data to DB
        break;

      case "charge.success":
        console.log("Charge successful");
        // Mark user as paid / extend plan
        break;

      case "invoice.payment_failed":
        console.log("Payment failed");
        // Notify user or pause service
        break;

      case "subscription.disable":
        console.log("Subscription canceled");
        // Update DB subscription status
        break;

      default:
        console.log("⚠️ Unhandled event:", event.event);
    }
  } else {
    console.log("❌ Invalid signature");
  }

  res.sendStatus(200);
});

export default router;
