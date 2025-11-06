import mongoose from "mongoose";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Replace this with your MongoDB URI
const MONGO_URI = process.env.MONGO_URI;

const seedTestSubscriptions = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Fetch an existing user or create a test user
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        email: "testuser@example.com",
        authorizationCode: "AUTH_123456",
        customerCode: "CUS_123456",
      });
      console.log("👤 Created a test user");
    }

    // Create a subscription renewal time for 2 minutes from now
    const nextPaymentDate = new Date(Date.now() + 2 * 60 * 1000);

    const subscription = await Subscription.create({
      user: user._id,
      subscriptionCode: "SUB_TEST_" + Date.now(),
      planCode: "PLN_TEST",
      status: "active",
      nextPaymentDate,
      lastReminderSent: null,
    });

    console.log("📦 Seeded test subscription:", subscription);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedTestSubscriptions();
