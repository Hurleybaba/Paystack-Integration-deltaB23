import crypto from "crypto";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";

export const paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers["x-paystack-signature"];

    // ✅ Hash incoming raw request
    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.body)
      .digest("hex");

    if (hash !== signature) {
      console.log("❌ Invalid Paystack signature");
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString("utf8"));
    console.log("✅ Paystack Webhook Event:", event.event);

    switch (event.event) {
      case "subscription.create": {
        try {
          const data = event.data;
          const subscriptionCode = data.subscription_code;
          const email = data.customer.email;
          const planCode = data.plan.plan_code;
          const status = data.status;

          console.log("🟢 Subscription created:", subscriptionCode);

          const user = await User.findOne({ email });
          if (user) {
            const exists = await Subscription.findOne({ subscriptionCode });
            if (!exists) {
              await Subscription.create({
                user: user._id,
                subscriptionCode,
                planCode,
                status,
                nextPaymentDate: new Date(data.next_payment_date * 1000), // convert timestamp to Date
              });
            } else {
              console.log(`ℹ️ Subscription ${subscriptionCode} already exists`);
            }
          }
        } catch (err) {
          console.error("❌ Error saving subscription:", err);
        }
        break;
      }

      case "charge.success": {
        try {
          const data = event.data;
          const authCode = data.authorization.authorization_code;
          const customerCode = data.customer.customer_code;
          const email = data.customer.email;

          console.log("💳 Charge successful:", data.reference);
          console.log("🔐 Authorization code:", authCode);
          console.log("🧾 Customer code:", customerCode);

          await User.findOneAndUpdate(
            { email },
            {
              authorizationCode: authCode,
              customerCode: customerCode,
            },
            { new: true }
          );
        } catch (err) {
          console.error("❌ Error saving authorization/customer code:", err);
        }
        break;
      }

      case "invoice.payment_failed": {
        try {
          console.log("❌ Invoice failed:", event.data.invoice_code);
          // Optional: Notify user or flag failed payment
        } catch (err) {
          console.error("❌ Error handling invoice payment failed:", err);
        }
        break;
      }

      case "subscription.disable": {
        try {
          const subscriptionCode = event.data.subscription_code;
          console.log("🔴 Subscription disabled:", subscriptionCode);

          await Subscription.findOneAndUpdate(
            { subscriptionCode },
            { status: "inactive" }
          );
        } catch (err) {
          console.error("❌ Error disabling subscription:", err);
        }
        break;
      }

      case "subscription.enable": {
        try {
          const subscriptionCode = event.data.subscription_code;
          console.log("🟢 Subscription enabled:", subscriptionCode);

          await Subscription.findOneAndUpdate(
            { subscriptionCode },
            { status: "active" }
          );
        } catch (err) {
          console.error("❌ Error enabling subscription:", err);
        }
        break;
      }

      default:
        console.log("⚠️ Unhandled event:", event.event);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.sendStatus(400);
  }
};
