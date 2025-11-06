import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  authorizationCode: String,
  customerCode: String,
});


export default mongoose.model("User", userSchema);
