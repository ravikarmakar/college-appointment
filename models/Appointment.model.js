import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  availabilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Availability",
    required: true,
  },
  timeSlot: {
    startTime: {
      type: String,
      required: [true, "Please add a start time"],
    },
    endTime: {
      type: String,
      required: [true, "Please add an end time"],
    },
  },
  date: {
    type: Date,
    required: [true, "Please add a date"],
  },
  status: {
    type: String,
    enum: ["booked", "cancelled"],
    default: "booked",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for faster queries
AppointmentSchema.index({ studentId: 1 });
AppointmentSchema.index({ professorId: 1 });

const Appointment = mongoose.model("Appointment", AppointmentSchema);

export default Appointment;
