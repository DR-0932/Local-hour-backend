import { Router } from "express";
import { getEvents, register_for_free_event } from "../controllers/businessControllers";


export const business_router:Router = Router();


// business_router.post('/register',initiateRegistration); //eventId to be passed from frontend in a form format
business_router.get('/event',getEvents)
business_router.post('/register',register_for_free_event)


