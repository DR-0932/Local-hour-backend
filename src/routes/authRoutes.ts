import { Router } from "express";
import { login,signup } from "../controllers/authControllers.js";
import { authMiddleware } from "../controllers/authMiddleware.js";


const auth_router:Router = Router();

auth_router.post('/signup',signup)
auth_router.post('/login',login)

export default auth_router