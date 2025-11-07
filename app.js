import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import { subscriptionExpiryCheckerCron } from "./utils/cronJobTest.js";

dotenv.config();
const app = express();
app.use(express.static("public"));
app.use(cors());

app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.startsWith("/api/webhooks")) {
        req.rawBody = buf.toString(); // save raw data string
      }
    },
  })
);

// Routes
app.use("/api/webhooks", webhookRoutes);
app.use(bodyParser.json());
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/payments", paymentRoutes);

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./public" });
});

app.get("/", (req, res) => {
  res.send("Paystack Webhook Active");
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT || 5001, () => {
  console.log(`🚀 Server is running on port ${process.env.PORT || 5001}`);
  subscriptionExpiryCheckerCron();
  console.log("✅ Cron Job Mounted")
});