const mongoose = require('mongoose')

const leaveSchema = new mongoose.Schema({
    employeeId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    empName:{
        type:String,
        required: true,
    },
    dept:{
        type:String,
        required: true,
    },
    startDate :{
        type:Date,
        required:true
    },
    endDate :{
        type:Date,
        required:true
    },
    leaveType:{
        type: String,
        enum:["sickLeave" , "casualLeave" , "annualLeave"],
        required: true
    },
    reason:{
        type: String
    },
    status:{
        type: String,
        enum:["approved","rejected","pending"],
        default:"pending"
    },
    appliedAt:{
        type:Date,
        default: Date.now
    },
    updatedAt:{
        type:Date,
        default: Date.now
    }
})

const Leave = mongoose.model('Leave' , leaveSchema);
module.exports = Leave;