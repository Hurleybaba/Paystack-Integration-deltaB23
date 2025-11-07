import cron from "node-cron";
import { sendEmail } from "./emailService.js";
import {
  findSubscriptionsDueForReminder,
  updateLastReminderSent,
} from "../utils/dbUtils.js";

// Run daily at 2:00 PM (adjust cron pattern as needed)
export const subscriptionReminderCron = () => {
  cron.schedule("0 14 * * *", async () => {
    console.log("⏰ Running subscription reminder cron job...");
    try {
      const reminderDays = [3, 1, 0];
      const now = new Date();

      for (const daysBefore of reminderDays) {
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + daysBefore);

        const subscriptions = await findSubscriptionsDueForReminder(targetDate);

        for (const sub of subscriptions) {
          const { email, plan_code, next_payment_date, subscription_code, id } = sub;

          await sendEmail(
            email,
            "Subscription Renewal Reminder",
            `Hi ${email}, your subscription for plan ${plan_code} will renew in ${daysBefore} day(s) on ${new Date(
              next_payment_date
            ).toDateString()}.`
          );

          console.log(
            `📩 Reminder sent to ${email} for subscription ${subscription_code} (${daysBefore} day(s) before renewal)`
          );

          await updateLastReminderSent(id);
        }
      }
      console.log("✅ Reminder cron job completed successfully.");
    } catch (err) {
      console.error("❌ Cron job error:", err);
    }
  });
};
