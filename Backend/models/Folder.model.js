// models/Folder.js
const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // employees only
  createdAt: { type: Date, default: Date.now },
});

const Folder = mongoose.model("Folder", folderSchema);
export default Folder;
