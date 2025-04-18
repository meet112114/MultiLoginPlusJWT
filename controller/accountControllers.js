const bcrypt = require('bcrypt');
const EMP = require('../models/emp');
const jwt = require('jsonwebtoken');
const Salary = require('../models/salary')


const addEmployee = async (req, res) => {
  if (req.body) {
    const profilPicture = req.file ? req.file.path : '';
    const {
      email,
      name,
      password,
      department,
      address,
      contactNo,
      designation,
      dob,
      gender,
      maritalStatus,
    } = req.body;

    const emp = await EMP.findOne({ email });

    const [day, month, year] = dob.split('/');
    const parsedDOB = new Date(`${year}-${month}-${day}`);
    if (isNaN(parsedDOB)) {
      return res.status(400).json({ message: 'Invalid date format. Use dd/mm/yyyy' });
    }

    if (!emp) {
      try {
        const newEmp = new EMP({
          email,
          password,
          type: 'employee',
          profilPicture,
          department,
          address,
          contactNo,
          designation,
          dob: parsedDOB,
          gender,
          maritalStatus,
          name,
        });

        const savedEmp = await newEmp.save();

        // 💰 Create salary record with default 0 values
        const newSalary = new Salary({
          employeeId: savedEmp._id,
          basicPay: 0,
          allowance: 0,
          deduction: 0,
          netSalary: 0,
        });

        await newSalary.save();

        console.log('Employee and salary saved successfully.');
        res.status(201).json({ message: 'Employee registered successfully' });
      } catch (error) {
        console.error('Error saving employee or salary:', error);
        res.status(500).json({ error: 'An error occurred while registering the employee' });
      }
    } else {
      res.status(400).json({ message: 'User email already registered' });
    }
  } else {
    res.status(400).json({ message: 'Request body is missing' });
  }
};


const addAdmin = async (req, res) => {
    const { email, name, password, department, address, contactNo, designation, dob, gender, maritalStatus, salary } = req.body;
    const profilPicture = req.file ? req.file.path : '';
  
    if (!email || !name || !password) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }
  
    try {
        // Check if admin already exists
        const existingAdmin = await EMP.findOne({ email, type: "admin" });
  
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }
  
  
        const newAdmin = new EMP({
            email,
            password: password,
            type: "admin",  
            profilPicture,
            department,
            address,
            contactNo,
            designation: designation || "Admin",  // Default designation
            dob: dob || null,
            gender: gender || null,
            maritalStatus: maritalStatus || null,
            salary: salary || 0,
            name
        });
  
        await newAdmin.save();
        console.log('Admin added successfully.');
        res.status(201).json({ message: 'Admin registered successfully' });
  
    } catch (error) {
        console.error('Error adding admin:', error);
        res.status(500).json({ error: 'An error occurred while adding the admin' });
    }
  };



  const loginRouteEmp = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const empLogin = await EMP.findOne({ email });
  
      if (!empLogin) {
        return res.status(404).json({ error: 'User not found. Please register first.' });
      }
  
      if (empLogin.type !== 'employee') {
        return res.status(403).json({ error: 'Email is registered as a admin account.' });
      }
  
      const isMatch = await bcrypt.compare(password, empLogin.password);
  
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      let token = jwt.sign(
        { email: empLogin.email, type: empLogin.type },
        process.env.SECRET_KEY,
        { expiresIn: '7d' }
      );
  
      res.cookie('jwtoken', token, {
        expires: new Date(Date.now() + 2589200000),
        httpOnly: true
      });
  
      return res.status(200).json({
        message: "Login successful",
        token,
        userType: empLogin.type
      });
  
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
const loginRouteAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const adminLogin = await EMP.findOne({ email });

    if (!adminLogin) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    if (adminLogin.type !== 'admin') {
      return res.status(403).json({ error: 'Email is registered as an employee account.' });
    }

    const isMatch = await bcrypt.compare(password, adminLogin.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let token = jwt.sign(
      { email: adminLogin.email, type: adminLogin.type },
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.cookie('jwtoken', token, {
      expires: new Date(Date.now() + 2589200000),
      httpOnly: true
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      userType: adminLogin.type
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { addEmployee, addAdmin, loginRouteEmp ,loginRouteAdmin };
