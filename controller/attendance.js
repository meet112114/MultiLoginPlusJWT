const Attendance = require("../models/attendance");
const EMP = require("../models/emp");
const Leave = require("../models/leave")
const moment = require("moment");

const getCurrentWeekAttendance = async (req, res) => {
  try {
    const employeeId = req.userID;
    const startOfWeek = moment().startOf("isoWeek").toDate();
    const endOfWeek = moment().endOf("isoWeek").toDate();

    const records = await Attendance.find({
      employeeId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
    }).sort({ date: 1 });

    res.status(200).json({ attendance: records });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance." });
  }
};
// Employee Check-in
const checkIn = async (req, res) => {
    try {
        const employeeId = req.params.id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);  // Reset time to compare only date

        let attendance = await Attendance.findOne({ employeeId, date: today });

        if (attendance) {
            return res.status(400).json({ message: "You have already checked in today!" });
        }

        attendance = new Attendance({
            employeeId,
            date: today,
            checkIn: new Date(),
            status: "Present"
        });

        await attendance.save();
        res.status(200).json({ message: "Check-in successful!", attendance });

    } catch (error) {
        console.error("Check-in error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Employee Check-out
const checkOut = async (req, res) => {
    try {
           const employeeId = req.params.id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({ employeeId, date: today });

        if (!attendance || attendance.checkOut) {
            return res.status(400).json({ message: "You have not checked in or already checked out today!" });
        }

        attendance.checkOut = new Date();
        const diff = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60); // Convert ms to hours
        attendance.totalHours = diff;
        attendance.status = diff >= 4 ? "Present" : "Half-day";  // Mark as Half-day if <4 hours

        await attendance.save();
        res.status(200).json({ message: "Check-out successful!", attendance });

    } catch (error) {
        console.error("Check-out error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Admin View All Attendance Records
const getAllAttendance = async (req, res) => {
    try {
        const { date } = req.query;  // Optional date filter

        let filter = {};
        if (date) {
            let selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);
            filter.date = selectedDate;
        }

        const attendanceRecords = await Attendance.find(filter).populate("employeeId", "name email");

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Employee View Own Attendance History
const getEmployeeAttendance = async (req, res) => {
    try {
        const employeeId = req.userID;
        const attendanceRecords = await Attendance.find({ employeeId }).sort({ date: -1 });

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const applyLeave = async (req, res) => {
    try {
      const employeeId = req.userID;
  
      const { startDate, endDate, leaveType, reason } = req.body;
  
      if (!employeeId || !startDate || !endDate || !leaveType) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
      }
  
      // Fetch employee details using employeeId
      const employee = await EMP.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found.' });
      }
  
      const newLeave = new Leave({
        employeeId,
        empName: employee.name,
        dept: employee.department,
        startDate,
        endDate,
        leaveType,
        reason,
      });
  
      const savedLeave = await newLeave.save();
  
      res.status(201).json({ message: 'Leave applied successfully.', leave: savedLeave });
    } catch (error) {
      console.error('Error applying leave:', error);
      res.status(500).json({ message: 'Server error while applying leave.' });
    }
  };
  
  const updateLeaveStatus = async (req, res) => {
    try {
      const { leaveId, status } = req.body;
  
      // Capitalize and validate status
      const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (!['Approved', 'Rejected'].includes(formattedStatus)) {
        return res.status(400).json({ message: 'Status must be either "Approved" or "Rejected".' });
      }
  
      const updatedLeave = await Leave.findByIdAndUpdate(
        leaveId,
        { status: formattedStatus, updatedAt: new Date() },
        { new: true }
      );
  
      if (!updatedLeave) {
        return res.status(404).json({ message: 'Leave request not found.' });
      }
  
      res.status(200).json({ message: `Leave ${formattedStatus.toLowerCase()} successfully.`, leave: updatedLeave });
    } catch (error) {
      console.error('Error updating leave status:', error);
      res.status(500).json({ message: 'Server error while updating leave status.' });
    }
  };
  
const attendanceForToday =  async (req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
  
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
  
    const todayAttendance = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('employeeId', 'name department designation');
  
    res.json(todayAttendance);
  };
  
const getAllLeave = async (req, res) => {
    try {
      const leaves = await Leave.find().sort({ appliedAt: -1 });
      res.json(leaves);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };

  module.exports = { checkIn, checkOut, getAllAttendance, getEmployeeAttendance , applyLeave ,updateLeaveStatus , getCurrentWeekAttendance , attendanceForToday , getAllLeave};
