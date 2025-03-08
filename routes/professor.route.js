import { Router } from "express";
import {
  setAvailability,
  getAppointments,
  cancelAppointment,
} from "../controllers/professor.controller.js";
import { protectRoute, authorize } from "../middleware/protectRoute.js";

const router = Router();

router.use(protectRoute);
router.use(authorize("professor"));

router.post("/availability", setAvailability); // working
router.get("/appointments", getAppointments); // working
router.delete("/cancel/:appointmentId", cancelAppointment);

export default router;
