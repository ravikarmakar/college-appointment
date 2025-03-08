import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register); // working
router.post("/login", login); // working

export default router;
