import { Router } from "express";
import { protectRoute, authorize } from "../middleware/protectRoute.js";
import {
  getProfessorAvailability,
  bookAppointment,
  getAppointments,
} from "../controllers/student.controller.js";

const router = Router();

// All routes in this file are protected and only accessible by students
router.use(protectRoute);
router.use(authorize("student"));

router.get("/availability/:professorId", getProfessorAvailability); // working
router.post("/book", bookAppointment); // working
router.get("/appointments", getAppointments); // working

export default router;
