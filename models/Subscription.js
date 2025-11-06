import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subscriptionCode: String,
  planCode: String,
  status: String, // active/inactive
  nextPaymentDate: Date,
  lastReminderSent: { type: Date, default: null }, // ✅ Track last reminder
});

export default mongoose.model("Subscription", subscriptionSchema);
