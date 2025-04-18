const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const EmpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["admin", "employee"], required: true },
    profilPicture: { type: String }, 
    department: { type: String , required: true },
    address: { type: String },
    contactNo: { type: String, required: true },
    designation: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    maritalStatus: { type: String, enum: ["single", "married", "divorced", "widowed"], required: true }
  },
  { timestamps: true } 
);

EmpSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});



const EMP = mongoose.model("EMP", EmpSchema);
module.exports = EMP;
