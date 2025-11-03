import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import bodyParser from "body-parser";

import subscriptionRoutes from "./routes/subscriptionRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


// Routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);

// Error Handling Middleware
app.use(errorHandler);



app.listen(process.env.PORT || 5001, () => {
  console.log(`Server is running on port ${process.env.PORT || 5001}`);
});
