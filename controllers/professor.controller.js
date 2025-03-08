import Availability from "../models/Availability.model.js";
import Appointment from "../models/Appointment.model.js";

export const setAvailability = async (req, res) => {
  try {
    const { date, timeSlots } = req.body;

    if (!date || !timeSlots || !timeSlots.length) {
      return res.status(400).json({
        success: false,
        message: "Please provide date and time slots",
      });
    }

    // Normalize date format (YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Check if professor already has availability for that date
    let availability = await Availability.findOne({
      professorId: req.user._id,
      date: formattedDate,
    });

    if (availability) {
      // Prevent duplicate time slots
      const existingTimes = new Set(
        availability.timeSlots.map(
          (slot) => `${slot.startTime}-${slot.endTime}`
        )
      );
      const newTimeSlots = timeSlots.filter(
        (slot) => !existingTimes.has(`${slot.startTime}-${slot.endTime}`)
      );

      if (!newTimeSlots.length) {
        return res.status(400).json({
          success: false,
          message: "No new time slots added (duplicates detected)",
        });
      }

      // Update availability
      availability.timeSlots.push(...newTimeSlots);
      await availability.save();
    } else {
      // Create new availability
      availability = await Availability.create({
        professorId: req.user._id,
        date: formattedDate,
        timeSlots,
      });
    }

    res.status(201).json({
      success: true,
      data: availability,
    });
  } catch (err) {
    console.error("Error in setAvailability:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      professorId: req.user._id,
    })
      .populate({
        path: "studentId",
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

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Checking appointment belongs to professor
    if (appointment.professorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to cancel this appointment",
      });
    }

    // Update appointment status
    appointment.status = "cancelled";
    await appointment.save();

    // Update availability slot to be available again
    const availability = await Availability.findById(
      appointment.availabilityId
    );

    if (availability) {
      const timeSlotIndex = availability.timeSlots.findIndex(
        (slot) =>
          slot.startTime === appointment.timeSlot.startTime &&
          slot.endTime === appointment.timeSlot.endTime
      );

      if (timeSlotIndex !== -1) {
        availability.timeSlots[timeSlotIndex].isBooked = false;
        await availability.save();
      }
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    console.error("Error in cancelAppointment:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
