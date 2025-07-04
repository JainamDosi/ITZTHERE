import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: Number, required: true }, // in bytes
  type: { type: String }, // mime type
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  url: { type: String, required: true },
  assignedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  createdAt: { type: Date, default: Date.now },
});

const File = mongoose.model("File", fileSchema);
export default File;
