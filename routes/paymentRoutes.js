import express from "express";
import { verifyPayment, initializePayment, listTransactions } from "../controllers/paymentController.js";

import { validateSignature } from "../middlewares/validateSignature.js";

const router = express.Router();

router.get("/verify/:reference", verifyPayment);

router.post("/initialize", initializePayment);

router.get("/list", listTransactions);

export default router;
