import crypto from "crypto";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";

// Helper: find user by email, create if not exists
const findOrCreateUser = async (email) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email });
    console.log("🆕 New user created:", email);
  }
  return user;
};

export const paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers["x-paystack-signature"];

    // Hash the raw body
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
      // Subscription created
      case "subscription.create": {
        try {
          const data = event.data;
          const subscriptionCode = data.subscription_code;
          const email = data.customer.email;
          const planCode = data.plan.plan_code;
          const status = data.status;

          const user = await findOrCreateUser(email);

          // Create subscription if it doesn't exist
          const exists = await Subscription.findOne({ subscriptionCode });
          if (!exists) {
            await Subscription.create({
              user: user._id,
              subscriptionCode,
              planCode,
              status,
              nextPaymentDate: new Date(data.next_payment_date * 1000), // convert timestamp
            });
            console.log("Subscription saved:", subscriptionCode);
          } else {
            console.log(`ℹ️ Subscription ${subscriptionCode} already exists`);
          }
        } catch (err) {
          console.error("❌ Error saving subscription:", err);
        }
        break;
      }

      // Successful charge (first payment or subscription renewal)
      case "charge.success": {
        try {
          const data = event.data;
          const authCode = data.authorization?.authorization_code;
          const customerCode = data.customer?.customer_code;
          const email = data.customer?.email;

          const user = await findOrCreateUser(email);

          // Update authorization and customer codes
          await User.findByIdAndUpdate(user._id, {
            ...(authCode && { authorizationCode: authCode }),
            ...(customerCode && { customerCode: customerCode }),
          });

          console.log("💳 Charge successful:", data.reference);
          console.log("🔐 Authorization code:", authCode);
          console.log("🧾 Customer code:", customerCode);
        } catch (err) {
          console.error("❌ Error updating authorization/customer code:", err);
        }
        break;
      }

      // Payment failed
      case "invoice.payment_failed":
        console.log("❌ Invoice failed:", event.data.invoice_code);
        break;

      // Subscription disabled
      case "subscription.disable":
        await Subscription.findOneAndUpdate(
          { subscriptionCode: event.data.subscription_code },
          { status: "inactive" }
        );
        console.log("🔴 Subscription disabled:", event.data.subscription_code);
        break;

      // Subscription enabled
      case "subscription.enable":
        await Subscription.findOneAndUpdate(
          { subscriptionCode: event.data.subscription_code },
          { status: "active" }
        );
        console.log("🟢 Subscription enabled:", event.data.subscription_code);
        break;

      default:
        console.log("⚠️ Unhandled event:", event.event);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.sendStatus(400);
  }
};
