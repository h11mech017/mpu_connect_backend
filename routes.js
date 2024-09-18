import express from "express";
import { UserController } from "./controllers/UserController.js";

const router = express.Router();

//User routes
router.get("/user/profile", UserController.getUserProfile);

export default router;
