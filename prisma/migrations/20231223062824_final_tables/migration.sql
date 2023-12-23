/*
  Warnings:

  - A unique constraint covering the columns `[current_vehicle_id]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "current_vehicle_id" TEXT;

-- CreateTable
CREATE TABLE "TripRequest" (
    "trip_id" TEXT NOT NULL,
    "plant_uuid_id" TEXT NOT NULL,
    "request_number" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "passengers_number" INTEGER NOT NULL,
    "people" TEXT[],
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "from_destination" TEXT NOT NULL,
    "to_destination" TEXT NOT NULL,
    "pickup_point" TEXT NOT NULL,
    "trip_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comments" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "approved_by_manager" BOOLEAN NOT NULL,
    "assigned_car_id" TEXT NOT NULL,
    "assigned_driver_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripRequest_pkey" PRIMARY KEY ("trip_id")
);

-- CreateTable
CREATE TABLE "HandoverReceive" (
    "id" TEXT NOT NULL,
    "date_time" TIMESTAMP(3) NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "comments" TEXT,
    "status" TEXT NOT NULL,
    "vehicle_photos" TEXT[],
    "form_photo" TEXT,

    CONSTRAINT "HandoverReceive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "maintenanceId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "maintenance_type" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "maintenance_date" TIMESTAMP(3) NOT NULL,
    "maintenance_time" TIMESTAMP(3) NOT NULL,
    "maintenance_message" TEXT NOT NULL,
    "maintenance_status" TEXT NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("maintenanceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_current_vehicle_id_key" ON "Driver"("current_vehicle_id");

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_current_vehicle_id_fkey" FOREIGN KEY ("current_vehicle_id") REFERENCES "Vehicle"("vehicle_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRequest" ADD CONSTRAINT "TripRequest_plant_uuid_id_fkey" FOREIGN KEY ("plant_uuid_id") REFERENCES "PlantMaster"("plant_uuid_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRequest" ADD CONSTRAINT "TripRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRequest" ADD CONSTRAINT "TripRequest_assigned_car_id_fkey" FOREIGN KEY ("assigned_car_id") REFERENCES "Vehicle"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRequest" ADD CONSTRAINT "TripRequest_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "Driver"("driver_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverReceive" ADD CONSTRAINT "HandoverReceive_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicle"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverReceive" ADD CONSTRAINT "HandoverReceive_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("driver_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;
