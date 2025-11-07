import crypto from "crypto";
import {
  findOrCreateUser,
  findSubscriptionByCode,
  createSubscription,
  updateUserCodes,
  updateSubscriptionStatus,
} from "../utils/dbUtils.js";

export const paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers["x-paystack-signature"];

    // Validate signature using the raw body
    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.log("❌ Invalid Paystack signature");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;
    console.log("✅ Paystack Webhook Event:", event.event);

    switch (event.event) {
      case "subscription.create": {
        const data = event.data;
        const email = data.customer.email;
        const user = await findOrCreateUser(email);

        const existingSub = await findSubscriptionByCode(data.subscription_code);
        if (!existingSub) {
          await createSubscription({
            userId: user.id,
            subscriptionCode: data.subscription_code,
            planCode: data.plan.plan_code,
            status: data.status,
            nextPaymentDate: new Date(data.next_payment_date),
          });
          console.log("💾 New subscription created:", data.subscription_code);
        } else {
          console.log("ℹ️ Subscription already exists:", data.subscription_code);
        }
        break;
      }

      case "charge.success": {
        const data = event.data;
        const email = data.customer.email;
        const user = await findOrCreateUser(email);

        await updateUserCodes({
          userId: user.id,
          authorizationCode: data.authorization?.authorization_code,
          customerCode: data.customer?.customer_code,
        });

        console.log("💳 Charge successful:", data.reference);
        break;
      }

      case "invoice.payment_failed":
        console.log("❌ Invoice failed:", event.data.invoice_code);
        break;

      case "subscription.not_renew":
        await updateSubscriptionStatus(event.data.subscription_code, "inactive");
        console.log("🔴 Subscription disabled:", event.data.subscription_code);
        break;

      case "subscription.enable":
        await updateSubscriptionStatus(event.data.subscription_code, "active");
        console.log("🟢 Subscription enabled:", event.data.subscription_code);
        break;

      default:
        console.log("⚠️ Unhandled event:", event.event);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.sendStatus(400);
  }
};
