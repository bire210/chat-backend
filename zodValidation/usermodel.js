import z from "zod";

const userSignupValidation = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  image: z
    .string()
    .default(
      "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg"
    ),
  isAdmin: z.boolean().default(false),
});

const userLoginValidation = z.object({
  email: z.string().email(),
  password: z.string(),
});

export {userLoginValidation,userSignupValidation}
