const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");

const addPlant = async (req, res) => {
  try {
    let { plant_id, plant_name } = req.body;

    plant_id = plant_id.toUpperCase();
    plant_name = plant_name.toUpperCase();

    // Check if plant_id or plant_name is already in the database
    const existingPlant = await prisma.plantMaster.findFirst({
      where: {
        OR: [{ plant_id }, { plant_name }],
      },
    });

    if (existingPlant) {
      return res
        .status(400)
        .json({ error: "Plant with the same ID or name already exists" });
    }

    const plant_uuid_id = uuidv4();

    // Add the new plant to the database
    const newPlant = await prisma.plantMaster.create({
      data: {
        plant_uuid_id,
        plant_id,
        plant_name,
      },
    });

    res.status(201).json(newPlant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const plantList = async (req, res) => {
  try {
    // Fetch all plants from the PlantMaster table
    const plantList = await prisma.plantMaster.findMany();

    res.status(200).json(plantList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { addPlant, plantList };
