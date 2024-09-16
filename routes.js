import express from "express";
import { UserController } from "./controllers/userController.js";

const router = express.Router();

const userController = new UserController();

//User routes
router.post('/login', userController.login);

export default router;
