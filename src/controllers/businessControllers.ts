import type { Request,Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { event_registration_schema} from "../../validation/validation.js";
// import { razorpay } from "../utils/razorpay";
// import crypto from "crypto";


// export async function initiateRegistration(req: Request, res: Response) {
//   const payload = req.body?.data || req.body;

//   if (!payload) {
//     return res.status(400).json({ error: "Invalid payload" });
//   }

//   const { name, email, contactNumber, eventId, userId } = payload;

//   if (!name || !email || !eventId) {
//     return res.status(400).json({ error: "Name, email, and eventId are required" });
//   }

//   try {
//     const result = await prisma.$transaction(async (tx) => {
//       const event = await tx.event.findUnique({
//         where: { id: eventId },
//       });

//       if (!event) {
//         throw new Error("EVENT_NOT_FOUND");
//       }

//       if (event.slotsLeft !== null && event.slotsLeft <= 0) {
//         throw new Error("NO_SLOTS_AVAILABLE");
//       }

//       const existingRegistration = await tx.registration.findUnique({
//         where: {
//           email_eventId: {
//             email,
//             eventId,
//           },
//         },
//       });

//       if (existingRegistration) {
//         throw new Error("ALREADY_REGISTERED");
//       }

//       const amountInRupees = Number(event.registrationFee) || 0;
//       const amountInPaise = Math.round(amountInRupees * 100);

//       const razorpayOrder = await razorpay.orders.create({
//         amount: amountInPaise,
//         currency: "INR",
//         receipt: `receipt_${Date.now()}`,
//       });

//       const transaction = await tx.transaction.create({
//         data: {
//           eventId,
//           userId: userId || null,
//           amount: amountInRupees,
//           status: "PENDING",
//           reference: razorpayOrder.id, 
//         },
//       });

//       return {
//         transactionId: transaction.id,
//         orderId: razorpayOrder.id,
//         amount: razorpayOrder.amount,
//         currency: razorpayOrder.currency,
//         name,
//         email,
//         phone: contactNumber,
//       };
//     });

//     return res.status(200).json({
//       message: "Razorpay order created successfully",
//       paymentDetails: result,
//     });
//   } catch (error: any) {
//     if (error.message === "EVENT_NOT_FOUND") {
//       return res.status(404).json({ error: "Event not found" });
//     }
//     if (error.message === "NO_SLOTS_AVAILABLE") {
//       return res.status(400).json({ error: "Event is fully booked" });
//     }
//     if (error.message === "ALREADY_REGISTERED") {
//       return res.status(409).json({ error: "This email is already registered for the event" });
//     }

//     console.error("Razorpay Order Creation Error:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

// export async function verifyPaymentAndRegister(req: Request, res: Response) {
//   const payload = req.body?.data || req.body;
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature, name, email, phone } = payload;

//   if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//     return res.status(400).json({ error: "Missing Razorpay verification parameters" });
//   }

//   try {
//     // 1. Verify Razorpay Signature (HMAC SHA256 of order_id + "|" + payment_id)
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       // Mark transaction as failed
//       await prisma.transaction.update({
//         where: { reference: razorpay_order_id },
//         data: { status: "FAILED" },
//       });
//       return res.status(400).json({ error: "Payment verification failed. Invalid signature." });
//     }

//     // 2. Perform DB operations atomically
//     const registration = await prisma.$transaction(async (tx) => {
//       const transaction = await tx.transaction.findUnique({
//         where: { reference: razorpay_order_id },
//       });

//       if (!transaction || transaction.status === "COMPLETED") {
//         throw new Error("INVALID_OR_PROCESSED_TRANSACTION");
//       }

//       // Mark transaction as COMPLETED
//       await tx.transaction.update({
//         where: { id: transaction.id },
//         data: { status: "COMPLETED" },
//       });

//       // Create Registration
//       const newRegistration = await tx.registration.create({
//         data: {
//           name,
//           email,
//           phone,
//           eventId: transaction.eventId,
//           userId: transaction.userId || null,
//         },
//       });

//       // Decrement event slot count
//       await tx.event.update({
//         where: { id: transaction.eventId },
//         data: {
//           slotsLeft: {
//             decrement: 1,
//           },
//         },
//       });

//       return newRegistration;
//     });

//     return res.status(201).json({
//       message: "Payment verified and registration completed successfully",
//       registration,
//     });
//   } catch (error: any) {
//     if (error.message === "INVALID_OR_PROCESSED_TRANSACTION") {
//       return res.status(400).json({ error: "Transaction invalid or already processed" });
//     }

//     console.error("Payment Verification Error:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }


export async function getEvents(req: Request, res: Response) {
  try {
    const upcomingEvents = await prisma.event.findMany({
      where: {
        startTime: {
          gte: new Date(),
        },
      },
      orderBy: {
        startTime: "asc",
      },
      include: {
        registrations: {
          select: {
            id: true,
          },
        },
      },
    });

    const formattedEvents = upcomingEvents.map((event) => ({
      ...event,
      registrationCount: event.registrations.length,
    }));

    return res.status(200).json(formattedEvents);
  } catch (error) {
    console.error("error in getting events", error);
    return res.status(500).json({ error: "Failed to fetch upcoming events" });
  }
}
  

export async function register_for_free_event(req: Request, res: Response) {
  const form_data = event_registration_schema.safeParse(req.body);
  if (!form_data.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { contact_number, full_name, email, eventId } = form_data.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        select: { registrationFee: true, isArchived: true, endTime: true },
      });

      const slot = await tx.event.updateMany({
        where: { id: eventId, slotsLeft: { gt: 0 } },
        data: { slotsLeft: { decrement: 1 } },
      });
      if (slot.count === 0) return { status: 409, error: "Event is full" };

      await tx.registration.create({
        data: {
          name: full_name,
          email: email.toLowerCase().trim(),
          phone: contact_number,
          eventId,
        },
      });

      return null; // success
    });

    if (result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    res.status(201).json({ message: "Successfully registered" });
  } catch (err) {
    console.error("register_for_free_event error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}