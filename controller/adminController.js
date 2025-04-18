const EMP = require("../models/emp");
const Leave = require("../models/leave");
const Salary = require("../models/salary");
const Dept = require('../models/department')

const moment = require("moment");

// GET /api/admin/stats
const getStats = async (req , res ) => {
  try {
    // Total Employees
    const totalEmployees = await EMP.countDocuments();

    // Unique Departments
    const departments = await Dept.countDocuments();
    // Total Salary Paid
    const salaryData = await Salary.aggregate([
      { $group: { _id: null, total: { $sum: "$netSalary" } } },
    ]);
    const totalSalary = salaryData[0]?.total || 0;

    // Leaves in current month
    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").toDate();

    const totalLeaves = await Leave.countDocuments({
      appliedAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const approvedLeaves = await Leave.countDocuments({
      appliedAt: { $gte: startOfMonth, $lte: endOfMonth },
      status: "approved",
    });

    const rejectedLeaves = await Leave.countDocuments({
      appliedAt: { $gte: startOfMonth, $lte: endOfMonth },
      status: "rejected",
    });

    res.json({
      totalEmployees,
      departments,
      totalLeaves,
      approvedLeaves,
      rejectedLeaves,
      totalSalary,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Server error fetching dashboard stats" });
  }
};

module.exports = { getStats }