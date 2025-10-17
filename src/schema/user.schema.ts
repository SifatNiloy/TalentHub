import z, { object, string, nativeEnum, TypeOf } from "zod";
import { USER_ROLES } from "../config/constansts";

export const createUserSchema = object({
  body: object({
    name: string().min(1, "Name is required"),
    email: string().email("Invalid email address"),
    password: string().min(6, "Password must be at least 6 characters"),
    role: nativeEnum(USER_ROLES),
    resumeUrl: z.url().optional(),
    companyName: string().optional(),
    website: string().url().optional(),
  }),
});

export const updateUserSchema = object({
  body: object({
    name: string().optional(),
    email: string().email().optional(),
    password: string().min(6).optional(),
    resumeUrl: string().url().optional(),
    companyName: string().optional(),
    website: string().url().optional(),
  }),
});

export type CreateUserDto = TypeOf<typeof createUserSchema>["body"];
export type UpdateUserDto = TypeOf<typeof updateUserSchema>["body"];
