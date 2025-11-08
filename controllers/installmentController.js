import { findOrCreateUser } from "../utils/dbUtils.js";
import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import paystack from "../config/paystackConfig.js";
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

export const getAllActiveInstallments = async (req, res) => {
  const { email } = req.query;
  try {
    const user = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (!user.rows.length) {
      return res.json({ success: false, message: "User not found", data: [] });
    }

    const userId = user.rows[0].id;
    const result = await pool.query(
      `SELECT * FROM installments WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: [] });
  }
};

export const getInstallmentDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM installments WHERE id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Installment not found.",
      });
    }

    const installment = result.rows[0];

    console.log("Fetched installment details:", installment);

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching installment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch installment details.",
      error: error.message,
    });
  }
};

export const getPaymentHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM installment_payments WHERE installment_id = $1 ORDER BY payment_date DESC`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No payment history found for this installment.",
        data: [],
      });
    }

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history.",
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
    const { email, id, firstTime } = req.body;

    let userId;
    let userEmail;
    let authorization_code;

    if (email) {
      const user = await findOrCreateUser(email);
      userId = user.id;
      userEmail = email;
      authorization_code = user.authorization_code;
    } else {
      const result = await pool.query(
        `SELECT * FROM installments WHERE id = $1`,
        [id]
      );

      console.log("USERR: ", result.rows[0]);

      userId = result.rows[0].user_id;

      const result2 = await pool.query(`SELECT * FROM users WHERE id = $1`, [
        userId,
      ]);
      userEmail = result2.rows[0].email;
      authorization_code = result2.rows[0].authorization_code;
    }

    // 1️⃣ Check if installment exists for user
    const installment = await pool.query(
      `SELECT * FROM installments WHERE user_id = $1 AND id = $2`,
      [userId, id]
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

    console.log("Auto-charging user:", userEmail, "Amount:", chargeAmount);

    // 4️⃣ Attempt to charge the user via Paystack

    let url = "";
    if (firstTime) {
      url = "transaction/initialize";
    } else {
      url = "/transaction/charge_authorization";
    }
    const chargeResponse = await paystack.post(url, {
      email: userEmail,
      amount: Number(chargeAmount) * 100, // Paystack expects kobo
      currency: "NGN",
      authorization_code,
      callback_url:
        "https://celesta-untutored-situationally.ngrok-free.dev/installment-dashboard.html", // Replace with your actual callback URL
    });

    console.log("Charge Response:", chargeResponse.data);

    const chargeData = chargeResponse.data;

    // 5️⃣ Update installment progress if charge succeeded
    if (chargeData.status === true) {
      console.log("Charge successful for user:", userEmail);
      const newPaid = Number(record.amount_paid) + Number(chargeAmount);

      console.log(record.amount_paid, chargeAmount);
      console.log("Updating installment record. New paid amount:", newPaid);

      // Update record in DB
      await pool.query(
        `UPDATE installments 
         SET amount_paid = $1, last_payment_date = NOW() 
         WHERE user_id = $2 AND id = $3`,
        [newPaid, userId, record.id]
      );

      // If fully paid, mark as complete
      if (newPaid >= record.total_amount) {
        await pool.query(
          `UPDATE installments SET status = 'completed' WHERE user_id = $1 AND id = $2`,
          [userId, record.id]
        );
      }

      await pool.query(
        `INSERT INTO installment_payments (id, user_id, installment_id, amount, payment_date)
       VALUES ($1, $2, $3, $4, NOW())`,
        [uuidv4(), userId, record.id, chargeAmount]
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
    console.error("Auto Charge Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error processing installment auto-charge.",
      error: err.message,
    });
  }
};
