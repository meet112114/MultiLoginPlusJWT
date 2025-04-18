const express = require('express');
require('../database/connection');
const router = express.Router();
router.use(express.json());
const cookieParser = require("cookie-parser");
router.use(cookieParser());
const {LoginAuth , verifyAdmin } = require('../middleware/jwtmiddleware');


const {  loginRouteEmp, addEmployee , addAdmin , loginRouteAdmin} = require('../controller/accountControllers');
const { checkIn, checkOut, getAllAttendance, getEmployeeAttendance , applyLeave ,updateLeaveStatus, getCurrentWeekAttendance , attendanceForToday , getAllLeave } = require('../controller/attendance')
const {getEmployeeDashboardData  , addSalary  , addDepartment , getEmployeeProfile , getUserLeaves , viewEmp ,UpdateEmpById , GetEmpById , editSalary , getSalary ,getDeptEmp , getDept}  = require('../controller/employeeController')
const {getStats} = require('../controller/adminController')
// multer config

const path = require('path');
const multer  = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './assets/images')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); 
    const originalName = path.basename(file.originalname, ext); 
    cb(null, `${originalName}-${uniqueSuffix}${ext}`); 
  }
})
updateLeaveStatus
const upload = multer({ storage: storage })




router.post('/addEmployee', LoginAuth, verifyAdmin ,upload.single('profilPicture') , addEmployee); // normal signup route 
router.post('/addAdmin', upload.single('profilPicture') , addAdmin); // normal signup route 
router.post('/login/emp' , loginRouteEmp);   // employee signin route
router.post('/login/admin' , loginRouteAdmin);   // admin signin route
router.post('/add/dept' , LoginAuth , verifyAdmin , addDepartment);
router.get('/get/attendance' , LoginAuth ,getCurrentWeekAttendance )
router.get('/emp/profile' , LoginAuth , getEmployeeProfile);
router.post("/check-in/:id", LoginAuth, checkIn);  // Employee checks in
router.post("/check-out/:id", LoginAuth, checkOut);  // Employee checks out
router.get("/all-attendance", LoginAuth, verifyAdmin, getAllAttendance);  // Admin views all attendance
router.get("/my-attendance", LoginAuth, getEmployeeAttendance);  // Employee views own attendance
router.post("/apply-leave", LoginAuth, applyLeave);  // Apply for  leave 
router.put("/update-leave" , LoginAuth , verifyAdmin , updateLeaveStatus);
router.get('/employee/dashboard' , LoginAuth ,getEmployeeDashboardData);
router.post('/add/emp/salary' ,LoginAuth , verifyAdmin , addSalary);
router.get('/get/leaves' , LoginAuth , getUserLeaves)
router.get("/stats" , getStats)
router.get('/get/Emp' , viewEmp)
router.get('/get/emp/:id' ,GetEmpById )
router.put('/update/emp/:id' , UpdateEmpById);
router.get('/today/attendance' , attendanceForToday);
router.put('/edit/salary/:employeeId' , editSalary);
router.get("/get/salary/:id" , LoginAuth , getSalary);
router.get('/dept/:deptName/employees' , getDeptEmp)
router.get('/get/departments' , getDept);
router.get('/get/all/leaves' , getAllLeave);
module.exports = router;