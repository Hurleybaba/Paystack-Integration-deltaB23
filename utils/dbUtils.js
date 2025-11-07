import pool from "../config/db.js";
import { v4 as uuidV4 } from "uuid";

/** ✅ Find or create user by email */
export const findOrCreateUser = async (email) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (rows.length > 0) return rows[0];

    const insertResult = await pool.query(
      "INSERT INTO users (id, email, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *",
      [uuidV4(), email]
    );
    console.log("🧍 Created new user:", insertResult.rows[0].email);
    return insertResult.rows[0];
  } catch (error) {
    console.error("Error in findOrCreateUser:", error);
    throw error;
  }
};

/** ✅ Find a subscription by subscription code */
export const findSubscriptionByCode = async (subscriptionCode) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM subscriptions WHERE subscription_code = $1",
      [subscriptionCode]
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error in findSubscriptionByCode:", error);
    throw error;
  }
};

/** ✅ Create a new subscription */
export const createSubscription = async ({
  userId,
  subscriptionCode,
  planCode,
  status,
  nextPaymentDate,
}) => {
  try {
    const query = `
      INSERT INTO subscriptions (id, user_id, subscription_code, plan_code, status, next_payment_date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`;
    const values = [
      uuidV4(),
      userId,
      subscriptionCode,
      planCode,
      status,
      nextPaymentDate,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error("Error in createSubscription:", error);
    throw error;
  }
};

/** ✅ Update user with authorization and customer codes */
export const updateUserCodes = async ({
  userId,
  authorizationCode,
  customerCode,
}) => {
  try {
    await pool.query(
      `UPDATE users
         SET authorization_code = COALESCE($1, authorization_code),
             customer_code = COALESCE($2, customer_code),
             updated_at = NOW()
       WHERE id = $3`,
      [authorizationCode, customerCode, userId]
    );
  } catch (error) {
    console.error("Error in updateUserCodes:", error);
    throw error;
  }
};

/** ✅ Update subscription status */
export const updateSubscriptionStatus = async (subscriptionCode, status) => {
  try {
    await pool.query(
      `UPDATE subscriptions
         SET status = $1,
             updated_at = NOW()
       WHERE subscription_code = $2`,
      [status, subscriptionCode]
    );
  } catch (error) {
    console.error("Error in updateSubscriptionStatus:", error);
    throw error;
  }
};

/** ✅ Find subscriptions due for reminder */
export const findSubscriptionsDueForReminder = async (targetDate) => {
  const query = `
    SELECT s.*, u.email
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    WHERE s.status = 'active'
      AND s.next_payment_date::date = $1::date
      AND (s.last_reminder_sent IS NULL OR s.last_reminder_sent::date < $1::date)
  `;
  const { rows } = await pool.query(query, [targetDate]);
  return rows;
};

/** ✅ Update last reminder sent */
export const updateLastReminderSent = async (subscriptionId) => {
  await pool.query(
    `UPDATE subscriptions SET last_reminder_sent = NOW(), updated_at = NOW() WHERE id = $1`,
    [subscriptionId]
  );
};

/** ✅ Find subscriptions expiring within the next 10 minutes */
export const findExpiringSubscriptions = async (now, tenMinutesLater) => {
  try {
    const query = `
      SELECT s.*, u.email
      FROM subscriptions s
      JOIN users u ON u.id = s.user_id
      WHERE s.status = 'active'
        AND s.next_payment_date BETWEEN $1 AND $2
        AND (s.last_reminder_sent IS NULL OR s.last_reminder_sent < NOW() - INTERVAL '10 minutes')
    `;
    const { rows } = await pool.query(query, [now, tenMinutesLater]);
    return rows;
  } catch (error) {
    console.error("Error in findExpiringSubscriptions:", error);
    throw error;
  }
};

/** ✅ Mark a subscription as checked (to avoid duplicate reminders) */
export const markSubscriptionChecked = async (subscriptionId) => {
  try {
    await pool.query(
      `
      UPDATE subscriptions
      SET last_reminder_sent = NOW(),
          updated_at = NOW()
      WHERE id = $1
      `,
      [subscriptionId]
    );
  } catch (error) {
    console.error("Error in markSubscriptionChecked:", error);
    throw error;
  }
};
