const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");

const allUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        user_id: true,
        name: true,
        profile_image: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching Users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const requestTrip = async (req, res) => {
  const {
    plant_uuid_id,
    user_id,
    vehicle_type,
    purpose,
    department,
    priority,
    passengers_number,
    people,
    start_time,
    end_time,
    from_destination,
    to_destination,
    pickup_point,
    trip_type,
    status,
    approved_by_manager,
  } = req.body;
  try {
    const trip_id = uuidv4();
    const random4DigitNumber = Math.floor(1000 + Math.random() * 9000);

    const newTripRequest = await prisma.tripRequest.create({
      data: {
        trip_id,
        plant_uuid_id,
        user_id,
        vehicle_type,
        purpose: purpose || null,
        department: department || null,
        priority: priority || null,
        passengers_number: passengers_number || 1,
        people: people || [],
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        from_destination,
        to_destination,
        pickup_point,
        trip_type: trip_type || null,
        status: status || "PENDING",
        approved_by_manager: approved_by_manager || false,
        otp: random4DigitNumber,
      },
    });

    await prisma.users.update({
      where: {
        user_id,
      },
      data: {
        triprequested: {
          increment: 1,
        },
      },
    });

    res.status(201).json(newTripRequest);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const recentTripUserId = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id parameter is required" });
    }

    const trips = await prisma.tripRequest.findMany({
      where: {
        user_id,
      },
      include: {
        user: true, // Include user information
      },
    });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching Trips:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const tripsForDriver = async (req, res) => {
  try {
    const { assigned_driver_id } = req.query;

    if (!assigned_driver_id) {
      return res.status(400).json({ error: "user_id parameter is required" });
    }

    const trips = await prisma.tripRequest.findMany({
      where: {
        assigned_driver_id,
      },
    });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching Trips:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const tripDetail = async (req, res) => {
  try {
    const { trip_id } = req.params;

    if (!trip_id) {
      return res.status(400).json({ error: "trip_id parameter is required" });
    }

    const tripDetails = await prisma.tripRequest.findUnique({
      where: {
        trip_id,
      },
      include: {
        plant_uuid: true,
        user: true,
        assigned_car: true,
        assigned_driver: true,
      },
    });

    if (!tripDetails) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Fetch details of people associated with the trip
    const peopleDetails = await prisma.users.findMany({
      where: {
        user_id: {
          in: tripDetails.people,
        },
      },
      select: {
        user_id: true,
        name: true,
        profile_image: true,
      },
    });

    // Combine tripDetails with peopleDetails
    const result = {
      ...tripDetails,
      people: peopleDetails,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching Trip details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const feedback = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const { rating, comments } = req.body;

    if (!trip_id || !rating) {
      return res
        .status(400)
        .json({ error: "trip_id, rating, and comments are required" });
    }

    // Update the trip in the TripRequest table
    const updatedTrip = await prisma.tripRequest.update({
      where: {
        trip_id,
      },
      data: {
        rating,
        comments,
      },
    });

    res.status(200).json({ message: "Trip updated successfully", updatedTrip });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchTripsWithStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const tripRequests = await prisma.tripRequest.findMany({
      where: {
        status: status || "Pending",
      },
      include: {
        user: true,
      },
    });

    res.json(tripRequests);
  } catch (error) {
    console.error("Error fetching trip requests:", error);
    res.status(500).send("Internal Server Error");
  }
};

const updateStatus = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { newStatus } = req.body;

    // Fetch the TripRequest from the database
    const tripRequest = await prisma.tripRequest.findUnique({
      where: { trip_id: tripId },
    });

    if (!tripRequest) {
      return res.status(404).json({ error: "TripRequest not found" });
    }

    // Update the status
    const updatedTripRequest = await prisma.tripRequest.update({
      where: { trip_id: tripId },
      data: { status: newStatus },
    });

    res.json(updatedTripRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  requestTrip,
  allUsers,
  recentTripUserId,
  tripDetail,
  feedback,
  tripsForDriver,
  fetchTripsWithStatus,
  updateStatus,
};
