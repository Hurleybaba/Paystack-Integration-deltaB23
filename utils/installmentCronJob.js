import cron from "node-cron";
import db from "../config/db.js";

export const installmentMonitorCron = () => {
  cron.schedule("* * * * *", async () => {
    console.log("🕐 Checking installment payments...");

    try {
      const result = await db.query(`
        SELECT * FROM installments
        WHERE status = 'active'
      `);

      if (result.rows.length === 0) {
        console.log("⚠️ No active installments found.");
        return;
      }

      for (const inst of result.rows) {
        const { id, user_id, amount_paid, total_amount, next_payment_date } = inst;

        // Check if installment is fully paid
        if (amount_paid >= total_amount) {
          await db.query(
            `UPDATE installments SET status = 'completed' WHERE id = $1`,
            [id]
          );
          console.log(`✅ Installment ${id} completed for user ${user_id}`);
          continue;
        }

        // Check if it's time for next payment
        const today = new Date();
        const dueDate = new Date(next_payment_date);

        if (today >= dueDate) {
          console.log(`💰 Reminder: User ${user_id} should pay next installment.`);

          // Move next_payment_date to same day next month (handles month-end)
          let newMonth = dueDate.getMonth() + 1;
          let newYear = dueDate.getFullYear();

          if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
          }

          const lastDayNextMonth = new Date(newYear, newMonth + 1, 0).getDate();
          const newDay = Math.min(dueDate.getDate(), lastDayNextMonth);

          const newDate = new Date(newYear, newMonth, newDay);

          await db.query(
            `UPDATE installments SET next_payment_date = $1 WHERE id = $2`,
            [newDate, id]
          );
          console.log(`🗓️ Next payment date updated to ${newDate.toDateString()} for user ${user_id}`);
        }
      }
    } catch (error) {
      console.error("❌ Error checking installments:", error.message);
    }
  });

  console.log("✅ Cron Job Mounted");
};

