const mongoose = require('mongoose')

const DeptSchema = new mongoose.Schema({
    deptName:{
        type: String,
        required: true
    },
    deptDesc:{
        type:String 
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }
})

const Dept = mongoose.model('Dept' , DeptSchema);
module.exports = Dept;