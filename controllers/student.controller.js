import mongoose from "mongoose";
import Availability from "../models/Availability.model.js";
import Appointment from "../models/Appointment.model.js";
import User from "../models/User.model.js";

export const getProfessorAvailability = async (req, res) => {
  try {
    // Validate professorId
    if (!mongoose.isValidObjectId(req.params.professorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid professor ID",
      });
    }

    // Check if professor exists & has role 'professor'
    const professor = await User.findById(req.params.professorId);
    if (!professor || professor.role !== "professor") {
      return res.status(404).json({
        success: false,
        message: "Professor not found",
      });
    }

    // Get today's date without time (for accurate comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all availabilities (only future dates)
    const availabilities = await Availability.find({
      professorId: req.params.professorId,
      date: { $gte: today },
    })
      .sort({ date: 1 })
      .lean();

    // Filter out booked time slots directly
    const filteredAvailabilities = availabilities.map((avail) => ({
      ...avail,
      timeSlots: avail.timeSlots.filter((slot) => !slot.isBooked),
    }));

    res.status(200).json({
      success: true,
      count: filteredAvailabilities.length,
      data: filteredAvailabilities,
    });
  } catch (err) {
    console.error("Error in getProfessorAvailability:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const { professorId, availabilityId, timeSlot, date } = req.body;

    // Checking not Empty Fields
    if (!professorId || !availabilityId || !timeSlot || !date) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Verify that the professor exists
    const professor = await User.findById(professorId);

    if (!professor || professor.role !== "professor") {
      return res.status(404).json({
        success: false,
        message: "Professor not found",
      });
    }

    // Find the availability
    const availability = await Availability.findById(availabilityId);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    // Check if the time slot exists and is not booked
    const timeSlotIndex = availability.timeSlots.findIndex(
      (slot) =>
        slot.startTime === timeSlot.startTime &&
        slot.endTime === timeSlot.endTime &&
        !slot.isBooked
    );

    if (timeSlotIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Time slot not available or already booked",
      });
    }

    // Create an appointment
    const appointment = await Appointment.create({
      studentId: req.user._id,
      professorId,
      availabilityId,
      timeSlot,
      date: new Date(date),
      status: "booked",
    });

    // Update availability to mark time slot as booked
    availability.timeSlots[timeSlotIndex].isBooked = true;
    await availability.save();

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    console.error("Error in bookAppointment:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      studentId: req.user._id,
    })
      .populate({
        path: "professorId",
        select: "name email",
      })
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (err) {
    console.error("Error in getAppointments:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
