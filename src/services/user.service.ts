/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserModel, UserRole } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import bcrypt from "bcrypt";

export const UserService = {
  async create(payload: any) {
    const existing = await UserModel.findOne({ email: payload.email });
    if (existing) throw new ApiError("Email already registered", 400);

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await UserModel.create({
      ...payload,
      password: hashedPassword,
    });

    return user;
  },

  async getById(id: string) {
    const user = await UserModel.findById(id);
    if (!user) throw new ApiError("User not found", 404);
    return user;
  },

  async findAll(query: { role?: UserRole; page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.role) filter.role = query.role;

    const [total, items] = await Promise.all([
      UserModel.countDocuments(filter),
      UserModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    ]);

    return { total, page, limit, items };
  },

  async update(id: string, payload: Partial<any>) {
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    const user = await UserModel.findByIdAndUpdate(id, payload, { new: true });
    if (!user) throw new ApiError("User not found", 404);

    return user;
  },

  async delete(id: string) {
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) throw new ApiError("User not found", 404);
    return user;
  },
};
