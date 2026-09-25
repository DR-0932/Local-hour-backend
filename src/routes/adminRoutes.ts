import { Router } from "express";
import { createEvent, deleteEvent } from "../controllers/adminControllers";
import { authMiddleware } from "../controllers/authMiddleware";

export const admin_router: Router = Router();

admin_router.post("/createEvent", authMiddleware, createEvent);
admin_router.delete("/event/:id", authMiddleware, deleteEvent);
// admin_router.patch("/delete",hideEvent)
// admin_router.put("/reschedule",rescheduleEvent)
//need to add delete event