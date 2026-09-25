import { number, z } from "zod";

export const usernameRule = z.string()
  .min(3, "At least 3 characters required for username")
  .max(50, "Username cannot exceed 50 characters");

export const passwordRule = z.string()
  .min(6, "At least 6 characters required for password")
  .max(50, "Password cannot exceed 50 characters");

export const emailRule = z.email("Invalid email address");

export const genderRule = z.enum(["Male", "Female"], {
  message: "Role must be Male or Female",
});

export const signup_schema = z.object({
  name: z.string()
    .min(3, "At least 3 characters required for name")
    .max(50),
  username: usernameRule,
  email: emailRule,
  password: passwordRule,
  gender: genderRule,
});

export const login_schema = z.object({
  loginIdentifier: z.string().min(1, "Username or email is required"),
  password: passwordRule,
});


export const event_registration_schema = z.object({
  contact_number: z.string().length(10,{message:"contact must be exactly 10 digits"}),
  full_name: z.string().min(3).max(50),
  email:emailRule,
  eventId:z.string().max(50),
 userId: z.string().uuid().nullish(),
   amount:z.string().max(50).optional()
  
})


export type SignupInput = z.infer<typeof signup_schema>;
export type LoginInput = z.infer<typeof login_schema>;
export type registrationInput = z.infer<typeof event_registration_schema>;