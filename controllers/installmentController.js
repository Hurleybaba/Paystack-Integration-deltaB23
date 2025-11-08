import { findOrCreateUser } from "../utils/dbUtils.js";
import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// POST /api/installments
export const createInstallment = async (req, res) => {
  try {
    const { email, totalAmount, monthlyPayment } = req.body;

    // Find or create user
    const user = await findOrCreateUser(email);
    const userId = user.id;

    // Calculate number of months
    const months = Math.ceil(totalAmount / monthlyPayment);

    // Set first payment date to 1 month from today (handles month-end)
    const today = new Date();
    let newMonth = today.getMonth() + 1;
    let newYear = today.getFullYear();

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    const lastDayNextMonth = new Date(newYear, newMonth + 1, 0).getDate();
    const newDay = Math.min(today.getDate(), lastDayNextMonth);
    const nextPaymentDate = new Date(newYear, newMonth, newDay);

    // Insert into DB
    const installment = await pool.query(
      `INSERT INTO installments (id, user_id, total_amount, monthly_payment, next_payment_date, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [uuidv4(), userId, totalAmount, monthlyPayment, nextPaymentDate, "active"]
    );

    res.status(201).json({
      success: true,
      message: `Installment plan created for ${months} months.`,
      data: installment.rows[0],
    });
  } catch (error) {
    console.error("❌ Error creating installment:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create installment plan.",
      error: error.message,
    });
  }
};

//when user pays the installment manually
export const payInstallment = async (req, res) => {
  try {
    const { email, amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0.",
      });
    }

    const user = await findOrCreateUser(email);
    const userId = user.id;

    // 1️⃣ Fetch installment record
    const installmentResult = await pool.query(
      `SELECT * FROM installments WHERE user_id = $1`,
      [userId]
    );

    if (!installmentResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No active installment found for this user.",
      });
    }

    const installment = installmentResult.rows[0];
    const remaining = installment.total_amount - installment.amount_paid;

    // 2️⃣ Prevent overpayment
    if (amount > remaining) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds remaining balance. You only owe ₦${remaining}.`,
      });
    }

    // 3️⃣ Update payment progress
    const newPaid = installment.amount_paid + amount;
    const newStatus =
      newPaid >= installment.total_amount ? "completed" : "active";

    const updated = await pool.query(
      `UPDATE installments
       SET amount_paid = $1,
           status = $2,
           next_payment_date = CASE WHEN $2 = 'completed' THEN NULL ELSE next_payment_date + INTERVAL '1 month' END
       WHERE user_id = $3
       RETURNING *`,
      [newPaid, newStatus, userId]
    );

    // 4️⃣ Optionally log this transaction
    await pool.query(
      `INSERT INTO installment_payments (user_id, amount, payment_date)
       VALUES ($1, $2, NOW())`,
      [userId, amount]
    );

    return res.status(200).json({
      success: true,
      message: `Installment payment of ₦${amount.toLocaleString()} successful.`,
      data: updated.rows[0],
    });
  } catch (error) {
    console.error("payInstallment Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process installment payment.",
      error: error.message,
    });
  }
};

//when we automatically charge the user for installment
export const autoChargeInstallment = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await findOrCreateUser(email);
    const userId = user.id;

    // 1️⃣ Check if installment exists for user
    const installment = await pool.query(
      `SELECT * FROM installments WHERE user_id = $1`,
      [userId]
    );

    if (!installment.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No active installment found.",
      });
    }

    const record = installment.rows[0];
    const remaining = record.total_amount - record.amount_paid;

    // 2️⃣ Determine how much to charge this month
    let chargeAmount = record.monthly_payment;
    if (chargeAmount > remaining) {
      chargeAmount = remaining; // only charge what’s left
    }

    // 3️⃣ If everything is already paid
    if (remaining <= 0) {
      return res.status(400).json({
        success: false,
        message: "Installment already fully paid.",
      });
    }

    // 4️⃣ Attempt to charge the user (using saved authorization)
    const authorization = record.authorization_code; // assume we stored this from the first payment
    if (!authorization) {
      return res.status(400).json({
        success: false,
        message: "No authorization found for recurring charge.",
      });
    }

    const chargeResponse = await paystack.post(
      "/transaction/charge_authorization",
      {
        email,
        amount: chargeAmount * 100, // Paystack expects kobo
        authorization_code: authorization,
      }
    );

    const chargeData = chargeResponse.data.data;

    // 5️⃣ Update installment progress if charge succeeded
    if (chargeResponse.data.status && chargeData.status === "success") {
      const newPaid = record.amount_paid + chargeAmount;

      // Update record in DB
      await pool.query(
        `UPDATE installments 
         SET amount_paid = $1, last_payment_date = NOW() 
         WHERE user_id = $2`,
        [newPaid, userId]
      );

      // If fully paid, mark as complete
      if (newPaid >= record.total_amount) {
        await pool.query(
          `UPDATE installments SET status = 'completed' WHERE user_id = $1`,
          [userId]
        );
      }

      await pool.query(
        `INSERT INTO installment_payments (user_id, installment_id, amount, payment_date)
       VALUES ($1, $2, $3, NOW())`,
        [userId, record.id, chargeAmount]
      );

      return res.status(200).json({
        success: true,
        message: `Charged ₦${chargeAmount.toLocaleString()} successfully.`,
        newBalance: record.total_amount - newPaid,
        chargeData,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Charge attempt failed.",
        details: chargeResponse.data.message || chargeResponse.data,
      });
    }
  } catch (err) {
    console.error("Auto Charge Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error processing installment auto-charge.",
      error: err.message,
    });
  }
};
