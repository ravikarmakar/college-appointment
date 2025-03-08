import mongoose from "mongoose";

const AvailabilitySchema = new mongoose.Schema({
  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: [true, "Please add a date"],
  },
  timeSlots: [
    {
      startTime: {
        type: String,
        required: [true, "Please add a start time"],
      },
      endTime: {
        type: String,
        required: [true, "Please add an end time"],
      },
      isBooked: {
        type: Boolean,
        default: false,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create index for faster queries
AvailabilitySchema.index({ professorId: 1, date: 1 });

const Availability = mongoose.model("Availability", AvailabilitySchema);

export default Availability;
