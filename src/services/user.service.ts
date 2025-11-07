/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserModel } from "../models/user.model";


export async function findUserById(id: string) {
  return UserModel.findById(id).select("-password");
}

export async function findUserByIdWithPassword(id: string) {
  return UserModel.findById(id);
}

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email });
}

export async function findUserByEmailWithoutPassword(email: string) {
  return UserModel.findOne({ email }).select("-password");
}

export async function createUser(payload: any) {
  return UserModel.create(payload);
}

export async function findAllUsers(
  filter: any,
  page: number,
  limit: number,
  searchQuery?: string
) {
  const query: any = { ...filter };

  // Add search functionality
  if (searchQuery) {
    query.$or = [
      { name: { $regex: searchQuery, $options: "i" } },
      { email: { $regex: searchQuery, $options: "i" } },
      { "companyProfile.companyName": { $regex: searchQuery, $options: "i" } }
    ];
  }

  return UserModel.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function countUsers(filter: any, searchQuery?: string) {
  const query: any = { ...filter };

  if (searchQuery) {
    query.$or = [
      { name: { $regex: searchQuery, $options: "i" } },
      { email: { $regex: searchQuery, $options: "i" } },
      { "companyProfile.companyName": { $regex: searchQuery, $options: "i" } }
    ];
  }

  return UserModel.countDocuments(query);
}

export async function updateUserById(id: string, payload: any) {
  return UserModel.findByIdAndUpdate(id, payload, { new: true }).select("-password");
}

export async function deleteUserById(id: string) {
  return UserModel.findByIdAndDelete(id).select("-password");
}

export async function updateUserPassword(id: string, hashedPassword: string) {
  return UserModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true }).select("-password");
}

export async function incrementProfileViews(id: string) {
  return UserModel.findByIdAndUpdate(id, { $inc: { profileViews: 1 } }, { new: true }).select("-password");
}

export async function updateLastLogin(id: string) {
  return UserModel.findByIdAndUpdate(id, { lastLoginAt: new Date() }, { new: true }).select("-password");
}

export async function verifyUserEmail(id: string) {
  return UserModel.findByIdAndUpdate(
    id,
    { isEmailVerified: true, emailVerifiedAt: new Date() },
    { new: true }
  ).select("-password");
}

export async function findUsersByRole(role: string, page: number, limit: number) {
  return UserModel.find({ role })
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function countUsersByRole(role: string) {
  return UserModel.countDocuments({ role });
}

export async function findUsersByStatus(status: string, page: number, limit: number) {
  return UserModel.find({ status })
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function findUsersBySkills(skills: string[], page: number, limit: number) {
  return UserModel.find({
    "jobSeekerProfile.skills.name": { $in: skills }
  })
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function findEmployersByIndustry(industry: string, page: number, limit: number) {
  return UserModel.find({
    role: "employer",
    "companyProfile.industry": industry
  })
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}