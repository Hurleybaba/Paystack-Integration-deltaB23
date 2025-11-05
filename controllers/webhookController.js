import crypto from "crypto";

export const paystackWebhook = (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // ✅ req.body is a Buffer (not object)
    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.body)
      .digest("hex");

    const signature = req.headers["x-paystack-signature"];

    if (hash !== signature) {
      console.log("❌ Invalid Paystack signature");
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // ✅ Safely parse the raw buffer
    const event = JSON.parse(req.body.toString("utf8"));

    console.log("✅ Paystack Webhook Event:", event.event);

    switch (event.event) {
      case "subscription.create":
        console.log("🟢 Subscription created:", event.data.subscription_code);
        // TODO: Save to DB
        break;

      case "charge.success":
        console.log("💰 Payment successful:", event.data.reference);
        // TODO: Mark payment as paid in DB
        break;

      case "invoice.payment_failed":
        console.log("❌ Invoice payment failed:", event.data.invoice_code);
        // TODO: Notify user / deactivate plan
        break;

      case "subscription.disable":
        console.log("🔴 Subscription disabled:", event.data.subscription_code);
        // TODO: Mark subscription as inactive
        break;

      case "subscription.enable":
        console.log("🟢 Subscription enabled:", event.data.subscription_code);
        // TODO: Mark subscription as active
        break;

      default:
        console.log("⚠️ Unhandled Paystack event:", event.event);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.sendStatus(400);
  }
};
