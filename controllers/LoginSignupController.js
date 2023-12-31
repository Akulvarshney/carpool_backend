const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");
const jwt = require("jsonwebtoken");

const allowedRoles = ["Manager", "Employee", "Driver", "CarOwner"];

const login = async (req, res) => {
  try {
    let { emailId, password } = req.body;

    emailId = emailId.toLowerCase();

    const user = await prisma.auth.findUnique({ where: { emailId } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.authentication_id },
      process.env.SECRE_KEY
    );

    let dataStored = false;
    let user_id = null;
    let auth_id = null;

    if (user.role === "Manager" || user.role === "Employee") {
      const userRecord = await prisma.users.findUnique({
        where: { authentication_id: user.authentication_id },
      });

      if (userRecord) {
        dataStored = true;
        user_id = userRecord.user_id;
      } else {
        dataStored = false;
        auth_id = user.authentication_id;
      }
    } else if (user.role === "Driver") {
      const driverRecord = await prisma.driver.findUnique({
        where: { authentication_id: user.authentication_id },
      });

      if (driverRecord) {
        dataStored = true;
        user_id = driverRecord.driver_id;
      } else {
        dataStored = false;
        auth_id = user.authentication_id;
      }
    }

    if (auth_id) {
      res.status(200).json({ token, userRole: user.role, dataStored, auth_id });
    } else {
      res.status(200).json({ token, userRole: user.role, dataStored, user_id });
    }

    // res.status(200).json({ token, userRole: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const signupEmpMan = async (req, res, next) => {
  let { emailId, password, role } = req.body;

  emailId = emailId.toLowerCase();

  if (!emailId || !password || !role) {
    return next(
      errorHandler(400, `Missing required information: emailId, password, role`)
    );
  }

  if (!allowedRoles.includes(role)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid role", allowedRoles });
  }

  try {
    const userExistsQuery = await prisma.auth.findUnique({
      where: { emailId: emailId },
    });

    if (userExistsQuery) {
      return next(errorHandler(400, "User already exists"));
    }

    const authentication_id = uuidv4();

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdOn = new Date();

    await prisma.auth.create({
      data: {
        authentication_id,
        emailId,
        password: hashedPassword,
        created_on: createdOn,
        role,
      },
    });

    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    next(errorHandler(500, "Server Error"));
  } finally {
    await prisma.$disconnect();
  }
};

const register_User = async (req, res, next) => {
  const { name, emailId, address, designation, dob, mobileNumber } = req.body;

  if (!emailId || !name || !address) {
    return next(
      errorHandler(
        400,
        `Missing Required information ${emailId}, ${name}, ${address}`
      )
    );
  }

  try {
    // Step 1: Fetch authentication id from the auth table
    const authRecord = await prisma.auth.findUnique({
      where: { emailId },
    });

    if (!authRecord) {
      return res.status(404).json({ error: "Email not present in auth table" });
    }

    // Step 2: Check if authentication id is already in the users table
    const existingUser = await prisma.users.findUnique({
      where: { authentication_id: authRecord.authentication_id },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user_id = uuidv4();

    // Step 3: Add user details to the users table
    const newUser = await prisma.users.create({
      data: {
        authentication: {
          connect: { authentication_id: authRecord.authentication_id },
        },
        user_id,
        name,
        address,
        designation,
        dob: new Date(dob),
        role: authRecord.role,
        mobile_number: mobileNumber,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchUserDetailUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { userRole } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id parameter is required" });
    }

    // Fetch user details based on user_id
    let userDetails;

    if (userRole === "Driver") {
      // Fetch details from the driver table
      userDetails = await prisma.driver.findUnique({
        where: {
          driver_id: user_id,
        },
      });
    } else {
      // Fetch details from the users table
      userDetails = await prisma.users.findUnique({
        where: {
          user_id,
        },
      });
    }

    if (!userDetails) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { signupEmpMan, register_User, fetchUserDetailUserId, login };
