import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function createEvent(req: Request, res: Response) {
  const {
    title,
    description,
    startTime,
    endTime,
    venue,
    venueLink,
    numberOfParticipants,
    image,
    registrationFee,
  } = req.body;

  if (!title || !description || !startTime || !endTime || !venue || !image) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const slots = Number(numberOfParticipants);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    res.status(400).json({ error: "Invalid start or end time" });
    return;
  }
  if (!Number.isInteger(slots) || slots < 1) {
    res.status(400).json({ error: "Invalid number of participants" });
    return;
  }

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startTime: start,
        endTime: end,
        venue,
        venueLink,
        numberOfParticipants: slots,
        slotsLeft: slots, 
        image,
        registrationFee: Number(registrationFee) || 0,
      },
    });

    res.status(201).json({ message: "Successfully created", event });
  } catch (err) {
    console.error("Create Event Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteEvent(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ error: "Event ID is required" });
        return
    }

    try {
        const deletedEvent = await prisma.event.delete({
            where: { id },
        });

        return res.status(200).json({
            message: "Event deleted successfully",
            event: deletedEvent,
        });
    } catch (error: any) {
        if (error?.code === "P2025") {
            return res.status(404).json({ error: "Event not found" });
        }

        console.error("Delete Event Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


export async function getParticipants(req: Request, res: Response){
    const id = req.params.id;
    if(!id){
        res.status(401).json({error:"bad request"})
        return
    }

    try{
        const participant_data = await prisma.registration.findMany({
            where:{
                eventId:id
            },
            select:{
                id:true,
                name:true,
                email:true,
                phone:true,
                userId:true,
                createdAt:true
            },
            orderBy:{createdAt:"desc"}
        })
        res.status(200).json({count: participant_data.length, participant_data})
    }catch(err){
        res.status(500).json({error:"internal server error",err})
    }
}

// export async function rescheduleEvent(req: Request, res: Response) {
//   const { id } = req.params;
//   const { dateOfEvent } = req.body;

//   if (!id || !dateOfEvent) {
//      res.status(400).json({ error: "Event ID and new dateOfEvent are required" });
//      return
//   }

//   const newDate = new Date(dateOfEvent);
//   if (!(newDate.getTime())) {
//     return res.status(400).json({ error: "Invalid date format" });
//   }

//   try {
//     const updatedEvent = await prisma.event.update({
//       where: { id },
//       data: {
//         dateOfEvent: newDate,
//       },
//     });

//     return res.status(200).json({
//       message: "Event rescheduled successfully",
//       event: updatedEvent,
//     });
//   } catch (error: any) {
//     if (error.code === "P2025") {
//       return res.status(404).json({ error: "Event not found" });
//     }
//     console.error("Reschedule Event Error:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

// export async function hideEvent(req: Request, res: Response) {
//   const { id } = req.params;

//   if (!id) {
//     return res.status(400).json({ error: "Event ID is required" });
//   }

//   try {
//     const hiddenEvent = await prisma.event.update({
//       where: { id },
//       data: {
//         // Requires 'isArchived Boolean @default(false)' in schema.prisma
//         isArchived: true, 
//       },
//     });

//     return res.status(200).json({
//       message: "Event hidden successfully",
//       event: hiddenEvent,
//     });
//   } catch (error: any) {
//     if (error.code === "P2025") {
//       return res.status(404).json({ error: "Event not found" });
//     }
//     console.error("Hide Event Error:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// } //manual or after deadline.//atleast hide it



// export async function deleteEvent(req: Request, res: Response) {
//   const { id } = req.params;

//   if (!id) {
//     return res.status(400).json({ error: "Event ID is required" });
//   }

//   try {
//     const deletedEvent = await prisma.event.delete({
//       where: { id },
//     });

//     return res.status(200).json({
//       message: "Event permanently deleted",
//       event: deletedEvent,
//     });
//   } catch (error: any) {
//     if (error.code === "P2025") {
//       return res.status(404).json({ error: "Event not found" });
//     }
//     console.error("Delete Event Error:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }