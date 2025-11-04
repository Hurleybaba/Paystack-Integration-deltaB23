// routes/webhookRoutes.js
import express from "express";
import { paystackWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// Paystack webhook endpoint (must use raw body parser)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paystackWebhook
);

export default router;
