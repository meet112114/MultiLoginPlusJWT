const mongoose = require('mongoose')

const salarySchema = new mongoose.Schema({
    employeeId:{
        type : mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'EMP'
    },
    basicPay:{
        type: Number,
        required:true
    },
    allowance:{
        type: Number,
        required:true
    },
    deduction:{
        type: Number,
        required:true
    },
    netSalary:{
        type:Number,
        required:true
    }
})

const Salary = mongoose.model("Salary" , salarySchema);
module.exports = Salary;