import express from "express";
import { createInstallment } from "../controllers/installmentController.js"

const router = express.Router();

router.post("/", createInstallment);

export default router;
