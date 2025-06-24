import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true }, // to ensure user belongs to org
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  verificationDocs: [String], // URLs to documents in Storj
  storagePlan: {
    type: String,
    enum: ["individual", "business", "business-plus"],
    default: "individual",
  },
  gstin: { type: String, required: true }, // GST number for Indian companies
  createdAt: { type: Date, default: Date.now },
});

const Company = mongoose.model("Company", companySchema);

export default Company;
