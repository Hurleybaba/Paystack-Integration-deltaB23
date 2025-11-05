// controllers/webhookController.js
import crypto from "crypto";

export const paystackWebhook = (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  // Generate hash
  const hash = crypto
    .createHmac("sha512", secret)
    .update(req.body)
    .digest("hex");

  // Verify signature
  if (hash === req.headers["x-paystack-signature"]) {
    const event = JSON.parse(req.body);

    console.log("✅ Webhook received:", event.event);

    // Handle different Paystack events
    switch (event.event) {
      case "subscription.create":
        console.log("New subscription created");
        // TODO: Save subscription to DB later
        break;

      case "charge.success":
        console.log("Charge successful");
        // TODO: Update user subscription status
        break;

      case "invoice.payment_failed":
        console.log("Payment failed");
        // TODO: Notify user or pause plan
        break;

      case "subscription.disable":
        console.log("Subscription disabled");
        // TODO: Mark subscription as inactive
        break;

      default:
        console.log("⚠️ Unhandled event:", event.event);
    }
  } else {
    console.log("❌ Invalid Paystack signature");
  }

  // Paystack expects a 200 response even if you don’t handle the event
  res.sendStatus(200);
};
