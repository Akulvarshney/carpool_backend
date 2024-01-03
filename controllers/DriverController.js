const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");

const addDriver = async (req, res, next) => {
  try {
    const {
      email,
      name,
      sex,
      vehicle_type,
      phoneNumber,
      state,
      city,
      location,
      plant_uuid_id,
      jobgrade,
      rating,
      trips_completed,
      experience,
      profile_image,
      shift_id,
      driver_employee_id,
      dob,
    } = req.body;

    // Ensure email is provided and not null
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate UUIDs
    const authId = uuidv4();
    const driverId = uuidv4();

    // Check if email exists in the auth table
    const existingUser = await prisma.auth.findUnique({
      where: { emailId: email },
    });

    if (existingUser) {
      // User with the same email already exists
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("Carpool123", 10);

    // Insert user into auth table
    const newUser = await prisma.auth.create({
      data: {
        authentication_id: authId,
        emailId: email,
        password: hashedPassword,
        role: "Driver",
        created_on: new Date(),
      },
    });

    const newDriver = await prisma.driver.create({
      data: {
        driver_id: driverId,
        authentication_id: authId,
        driver_employee_id: driver_employee_id || null,
        emailId: email,
        vehicle_type: vehicle_type || null,
        name: name || null,
        mobile_number: phoneNumber || null,
        location: location || null,
        city: city || null,
        state: state || null,
        sex: sex || null,
        plant_uuid_id: plant_uuid_id,
        jobgrade: jobgrade || null,
        experience: experience || null,
        rating: rating || null,
        trips_completed: trips_completed || 0,
        dob: new Date(dob) || null,
        profile_image: profile_image || null,

        shift_id: shift_id || null,
        created_on: new Date(),
      },
    });

    res.status(201).json({
      message: "User and Driver registered successfully",
      user: newUser,
      driver: newDriver,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

const fetchDriverList = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany();
    res.json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { addDriver, fetchDriverList };
