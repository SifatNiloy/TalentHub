/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDto, UpdateUserDto } from "../schema/user.schema";

// Interface to type route params
interface UserParams {
  id: string;
}

// Create a new user
export const createUserHandler = async (req: Request, res: Response) => {
  const payload: CreateUserDto = req.body;
  const user = await UserService.create(payload);
  res.status(201).json({ success: true, data: user });
};

// Get a single user by ID
export const getUserHandler = async (req: Request<UserParams>, res: Response) => {
  const { id } = req.params;
  const user = await UserService.getById(id);
  res.status(200).json({ success: true, data: user });
};

// Get all users with optional role filtering & pagination
export const getAllUsersHandler = async (req: Request, res: Response) => {
  const users = await UserService.findAll(req.query as any);
  res.status(200).json({ success: true, data: users });
};

// Update a user by ID
export const updateUserHandler = async (req: Request<UserParams>, res: Response) => {
  const { id } = req.params;
  const payload: UpdateUserDto = req.body;
  const user = await UserService.update(id, payload);
  res.status(200).json({ success: true, data: user });
};

// Delete a user by ID
export const deleteUserHandler = async (req: Request<UserParams>, res: Response) => {
  const { id } = req.params;
  const user = await UserService.delete(id);
  res.status(200).json({ success: true, data: user });
};
