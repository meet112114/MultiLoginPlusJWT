const Dept = require('../models/department')
const Attendance = require("../models/attendance");
const EMP = require("../models/emp");
const Leave = require("../models/leave")
const Salary = require("../models/salary")

const addDepartment = async (req, res) => {
    try {
      const { deptName, deptDesc } = req.body;
  
      if (!deptName) {
        return res.status(400).json({ message: "Department name is required" });
      }
  
      // Check if department already exists
      const existingDept = await Dept.findOne({ deptName });
      if (existingDept) {
        return res.status(409).json({ message: "Department already exists" });
      }
  
      const newDept = new Dept({
        deptName,
        deptDesc
      });
  
      await newDept.save();
      return res.status(201).json({ message: "Department added successfully", department: newDept });
  
    } catch (error) {
      console.error("Error adding department:", error);
      return res.status(500).json({ message: "Server error while adding department" });
    }
  };

const getEmployeeDashboardData = async (req, res) => {
    try {
      const employeeId = req.userID;
  
      const emp = await EMP.findById(employeeId).select("name email department");
  
      const latestSalary = await Salary.findOne({ employeeId });
    
  
      const allLeaves = await Leave.find({ employeeId });
      const rejectedLeaves = allLeaves.filter(leave => leave.status === "rejected");
  
      // Get current week's attendance
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);
  
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
  
      const weekAttendance = await Attendance.find({
        employeeId,
        date: {
          $gte: startOfWeek,
          $lte: endOfWeek
        }
      });
  
      res.status(200).json({
        employee: emp,
        latestSalary,
        totalLeaves: allLeaves.length,
        rejectedLeaves: rejectedLeaves.length,
        weekAttendance
      });
  
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  


  const addSalary = async (req, res) => {
    try {
        const adminId = req.userID;
        const { employeeId  ,basicPay, allowance, deduction, payDate } = req.body;
  
      // Validate required fields
      if (!employeeId || basicPay == null || allowance == null || deduction == null || !payDate) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      // Check if employee exists
      const employee = await EMP.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found." });
      }
  
      const netSalary = basicPay + allowance - deduction;
  
      const newSalary = new Salary({
        employeeId,
        basicPay,
        allowance,
        deduction,
        netSalary,
        payDate: new Date(payDate)
      });
  
      await newSalary.save();
  
      res.status(201).json({ message: "Salary record added successfully.", salary: newSalary });
    } catch (error) {
      console.error("Error adding salary:", error);
      res.status(500).json({ message: "Server error while adding salary." });
    }
  };


const editSalary = async (req, res) => {
  const { employeeId } = req.params;
  const { basicPay, allowance, deduction } = req.body;

  if (!basicPay || !allowance || !deduction) {
    return res.status(400).json({ message: "All salary fields are required" });
  }

  const netSalary = parseFloat(basicPay) + parseFloat(allowance) - parseFloat(deduction);

  try {
    const updatedSalary = await Salary.findOneAndUpdate(
      { employeeId },
      {
        basicPay,
        allowance,
        deduction,
        netSalary,
      },
      { new: true, upsert: true } // If not found, create one
    );

    res.status(200).json({ message: "Salary updated", updatedSalary });
  } catch (error) {
    console.error("Error updating salary:", error);
    res.status(500).json({ message: "Server error" });
  }
};

  
  const getEmployeeProfile = async (req, res) => {
    try {
      const employeeId = req.userID; // Assuming you're using auth middleware
      const emp = await EMP.findById(employeeId).select('-password'); // Don't send password
  
      if (!emp) {
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      res.status(200).json(emp);
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  const getUserLeaves = async (req, res) => {
    try {
      const employeeId = req.userID; // Assuming the employee ID is extracted from a JWT or session
  
      // Fetch all leave records for the current user
      const leaves = await Leave.find({ employeeId }).sort({ appliedAt: -1 }); // Sorting by date, most recent first
  
      if (!leaves || leaves.length === 0) {
        return res.status(404).json({ message: 'No leave records found for this user.' });
      }
  
      res.status(200).json({ leaves });
    } catch (error) {
      console.error('Error fetching leaves:', error);
      res.status(500).json({ message: 'Server error while fetching leaves.' });
    }
  };
  const viewEmp = async (req, res) => {
    try {
      const employees = await EMP.find({}); // select specific fields
      res.json(employees);
    } catch (err) {
      console.error('Error fetching employees:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const GetEmpById = async (req, res) => {
    const emp = await EMP.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    res.json(emp);
  };
  
  // Update employee
   const UpdateEmpById = async (req, res) => {
    try {
      const updatedEmp = await EMP.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedEmp);
    } catch (error) {
      res.status(500).json({ message: 'Error updating employee.' });
    }
  };

  const getSalary = async (req, res) => {
    try {
        const { id } = req.params;  // employee ID from URL
        const salary = await Salary.findOne({ employeeId: id });

        if (!salary) {
            return res.status(404).json({ message: 'Salary details not found for this employee' });
        }

        return res.status(200).json(salary);
    } catch (error) {
        console.error('Error fetching salary:', error);
        return res.status(500).json({ error: 'An error occurred while fetching salary' });
    }
};


// Get all departments
const getDept = async (req, res) => {
  try {
    const depts = await Dept.find().sort({ createdAt: -1 });
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get employees in a specific department
const getDeptEmp = async (req, res) => {
  try {
    console.log(req.params.deptName)
    const employees = await EMP.find({ department: req.params.deptName });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {addDepartment , getEmployeeDashboardData ,addSalary , getEmployeeProfile , getUserLeaves , viewEmp , GetEmpById , UpdateEmpById , editSalary , getSalary ,getDept , getDeptEmp}