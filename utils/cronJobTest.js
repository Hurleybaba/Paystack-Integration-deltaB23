import cron from "node-cron";
import { sendEmail } from "./emailService.js";
import { findExpiringSubscriptions, markSubscriptionChecked } from "../utils/dbUtils.js";

/**
 * Runs every 10 minutes to check subscriptions expiring soon (within next 10 minutes)
 */
export const subscriptionExpiryCheckerCron = () => {
  // Schedule job: runs every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    console.log("⏰ Running subscription expiry check (every 10 mins)...");

    try {
      // Current time
      const now = new Date();

      // Compute cutoff time = 10 minutes from now
      const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

      // 🔍 Fetch subscriptions expiring soon
      const subscriptions = await findExpiringSubscriptions(now, tenMinutesLater);

      if (subscriptions.length === 0) {
        console.log("✅ No subscriptions expiring in the next 10 minutes.");
        return;
      }

      console.log(`⚠️ Found ${subscriptions.length} subscription(s) expiring soon.`);

      for (const sub of subscriptions) {
        const { email, plan_code, next_payment_date, subscription_code, id } = sub;

        // 📧 Send warning or reminder email
        await sendEmail(
          email,
          "Subscription Expiring Soon",
          `Hi ${email}, your subscription for plan ${plan_code} will expire at ${new Date(
            next_payment_date
          ).toLocaleTimeString()}. Please ensure your payment method is active.`
        );

        console.log(
          `📩 Expiry warning sent to ${email} for subscription ${subscription_code}`
        );

        // 🕓 Optionally mark this record as checked, so it won’t send duplicates
        await markSubscriptionChecked(id);
      }

      console.log("✅ Expiry check completed successfully.");
    } catch (err) {
      console.error("❌ Expiry cron job error:", err);
    }
  });
};
