import cron from "node-cron";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { sendEmail } from "./emailService.js";

// Run daily at 8:00 AM
/*
export const subscriptionReminderCron = () => {
  cron.schedule("0 8 * * *", async () => {
    try {
      const now = new Date();

      // Reminders: 3 days, 1 day before renewal, and same-day
      const reminderDays = [3, 1, 0];

      for (const daysBefore of reminderDays) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysBefore);

        const subs = await Subscription.find({
          status: "active",
          nextPaymentDate: {
            $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            $lte: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
          $or: [
            { lastReminderSent: { $exists: false } }, // never sent
            {
              lastReminderSent: {
                $lt: new Date(targetDate.setHours(0, 0, 0, 0)),
              },
            }, // not sent today
          ],
        }).populate("user");

        for (const sub of subs) {
          if (!sub.user) continue;

          const user = sub.user;

          // Send reminder
          await sendEmail(
            user.email,
            "Subscription Renewal Reminder",
            `Hi ${user.email}, your subscription for plan ${
              sub.planCode
            } will renew in ${daysBefore} day(s) on ${sub.nextPaymentDate.toDateString()}.`
          );

          console.log(
            `📩 Reminder sent to ${user.email} for subscription ${sub.subscriptionCode} (${daysBefore} day(s) before renewal)`
          );

          // Update lastReminderSent
          sub.lastReminderSent = new Date();
          await sub.save();
        }
      }
    } catch (err) {
      console.error("❌ Cron job error:", err);
    }
  });
};
*/

// 2 mins reminder for testing.. no date check
export const subscriptionReminderCron = () => {
  cron.schedule("*/2 * * * *", async () => {
    console.log("🕑 Running subscription reminder cron job...");

    try {
      // Fetch all active subscriptions
      const subs = await Subscription.find({ status: "active" }).populate("user");

      for (const sub of subs) {
        if (!sub.user) continue;

        // Send reminder email
        await sendEmail(
          sub.user.email,
          "Subscription Renewal Reminder",
          `Hi ${sub.user.email}, your subscription for plan ${sub.planCode} is set to renew on ${new Date(
            sub.nextPaymentDate
          ).toUTCString()}.`
        );

        console.log(
          `📩 Reminder sent to ${sub.user.email} for subscription ${sub.subscriptionCode}`
        );
      }
    } catch (err) {
      console.error("❌ Cron job error:", err);
    }
  });
};