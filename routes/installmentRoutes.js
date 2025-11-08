import express from "express";
import {
  autoChargeInstallment,
  createInstallment,
  getAllActiveInstallments,
  payInstallment,
  getInstallmentDetails,
  getPaymentHistory
} from "../controllers/installmentController.js";

const router = express.Router();

router.post("/", createInstallment);

router.get("/active", getAllActiveInstallments);

router.get("/:id", getInstallmentDetails);

router.get("/:id/payments", getPaymentHistory);

router.post("/auto-pay", autoChargeInstallment);
router.post("/manual-pay", payInstallment);

export default router;
