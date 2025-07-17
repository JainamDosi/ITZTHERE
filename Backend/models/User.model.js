import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: function () {
      return (
        this.role !== "super-admin" &&
        this.role !== "client" &&
        this.role !== "Individual"
      );
    },
  }, // required only for admins and employees

  role: {
    type: String,
    enum: ["super-admin", "company-admin", "employee", "client", "Individual"],
    required: true,
  },

  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },

  affiliatedWith: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  ], // used only if role is 'client'

  verificationDoc: { type: String },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    required: function () {
      return this.role === "Individual";
    },
  },

  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
export default User;
