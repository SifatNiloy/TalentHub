import { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as UserService from "../services/user.service";
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  UpdateJobSeekerProfileDto,
  UpdateCompanyProfileDto,
  ChangePasswordDto
} from "../schema/user.schema";
import { SendSuccessResponse, SendErrorResponse } from "../utils";
import {
  INPUT_MISSING,
  INCORRECT_INPUT,
  DATA_NOT_FOUND,
  UNAUTHORIZED,
  ALREADY_EXISTS
} from "../constants/error-codes";
import { buildErrorPayload } from "../middleware/helpers";

// Create a new user
export async function createUserHandler(req: Request, res: Response) {
  const payload: CreateUserDto = req.body;

  // Check if user already exists
  const existingUser = await UserService.findUserByEmail(payload.email);
  if (existingUser) {
    return SendErrorResponse.conflict({
      res,
      ...buildErrorPayload(
        req,
        "createUserHandler",
        "Email already registered",
        ALREADY_EXISTS,
        "This email address is already registered. Please use a different email or login to your existing account.",
        "USER_MANAGEMENT"
      )
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(payload.password, 10);

 // Create user
  const user = await UserService.createUser({
    ...payload,
    password: hashedPassword
  });

  if (!user) {
    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req,
        "createUserHandler",
        "Failed to create user",
        DATA_NOT_FOUND,
        "Unable to create user account. Please try again later or contact support.",
        "USER_MANAGEMENT"
      )
    });
  }

  // Remove password from response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userResponse: any = user.toObject();
  delete userResponse.password;

  return SendSuccessResponse.created({
    res,
    message: "User created successfully!",
    data: userResponse
  });
}
// Get a single user by ID
export async function getUserHandler(req: Request, res: Response) {
  const { id } = req.params;

  const user = await UserService.findUserById(id);

  if (!user) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req,
        "getUserHandler",
        "User not found",
        DATA_NOT_FOUND,
        "The requested user could not be found. Please check the user ID and try again.",
        "USER_MANAGEMENT"
      )
    });
  }

  // Increment profile views
  await UserService.incrementProfileViews(id);

  return SendSuccessResponse.success({
    res,
    message: "User retrieved successfully!",
    data: user
  });
}

// Get all users with filtering & pagination
export async function getAllUsersHandler(req: Request, res: Response) {
  const { page = "1", limit = "10", role, status, search } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // Build filter
  const filter: any = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  const [total, users] = await Promise.all([
    UserService.countUsers(filter, search as string),
    UserService.findAllUsers(filter, pageNum, limitNum, search as string)
  ]);

  return SendSuccessResponse.success({
    res,
    message: "Users retrieved successfully!",
    data: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      items: users
    }
  });
}

// Update a user by ID
export async function updateUserHandler(req: Request, res: Response) {
  const { id } = req.params;
  const payload: UpdateUserDto = req.body;

  // Check if user exists
  const existingUser = await UserService.findUserById(id);
  if (!existingUser) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req,
        "updateUserHandler",
        "User not found",
        DATA_NOT_FOUND,
        "The user you're trying to update could not be found.",
        "USER_MANAGEMENT"
      )
    });
  }

  // If email is being updated, check if it's already taken
  if (payload.email && payload.email !== existingUser.email) {
    const emailExists = await UserService.findUserByEmail(payload.email);
    if (emailExists) {
      return SendErrorResponse.conflict({
        res,
        ...buildErrorPayload(
          req,
          "updateUserHandler",
          "Email already in use",
          ALREADY_EXISTS,
          "This email address is already registered to another account.",
          "USER_MANAGEMENT"
        )
      });
    }
  }

  // Remove undefined fields
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  );

  const updatedUser = await UserService.updateUserById(id, cleanPayload);

  return SendSuccessResponse.success({
    res,
    message: "User updated successfully!",
    data: updatedUser
  });
}

// Delete a user by ID
export async function deleteUserHandler(req: Request, res: Response) {
  const { id } = req.params;

  const user = await UserService.deleteUserById(id);

  if (!user) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req,
        "deleteUserHandler",
        "User not found",
        DATA_NOT_FOUND,
        "The user you're trying to delete could not be found.",
        "USER_MANAGEMENT"
      )
    });
  }

  return SendSuccessResponse.success({
    res,
    message: "User deleted successfully!",
    data: user
  });
}

// Update user profile (self-update)
export async function updateProfileHandler(req: Request, res: Response) {
  const userId = res.locals.user?.id;
  const payload: UpdateProfileDto = req.body;

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req,
        "updateProfileHandler",
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to update your profile.",
        "USER_MANAGEMENT"
      )
    });
  }

  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  );

  const updatedUser = await UserService.updateUserById(userId, cleanPayload);

  if (!updatedUser) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req,
        "updateProfileHandler",
        "User not found",
        DATA_NOT_FOUND,
        "Your profile could not be found.",
        "USER_MANAGEMENT"
      )
    });
  }

  return SendSuccessResponse.success({
    res,
    message: "Profile updated successfully!",
    data: updatedUser
  });
}

// Update job seeker profile
export async function updateJobSeekerProfileHandler(req: Request, res: Response) {
  const userId = res.locals.user?.id;
  const payload: UpdateJobSeekerProfileDto = req.body;

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req,
        "updateJobSeekerProfileHandler",
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to update your profile.",
        "USER_MANAGEMENT"
      )
    });
  }

  // Check if user is a job seeker
  const user = await UserService.findUserById(userId);
  if (!user) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req,
        "updateJobSeekerProfileHandler",
        "User not found",
        DATA_NOT_FOUND,
        "Your profile could not be found.",
        "USER_MANAGEMENT"
      )
    });
  }

  if (user.role !== "job_seeker") {
    return SendErrorResponse.forbidden({
      res,
      ...buildErrorPayload(
        req,
        "updateJobSeekerProfileHandler",
        "Invalid user role",
        INCORRECT_INPUT,
        "Only job seekers can update job seeker profiles.",
        "USER_MANAGEMENT"
      )
    });
  }

  const updatedUser = await UserService.updateUserById(userId, {
    jobSeekerProfile: payload
  });

  return SendSuccessResponse.success({
    res,
    message: "Job seeker profile updated successfully!",
    data: updatedUser
  });
}

// Update company profile
export async function updateCompanyProfileHandler(req: Request, res: Response) {
  const userId = res.locals.user?.id;
  const payload: UpdateCompanyProfileDto = req.body;

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req,
        "updateCompanyProfileHandler",
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to update your company profile.",
        "USER_MANAGEMENT"
      )
    });
  }

  // Check if user is an employer
  const user = await UserService.findUserById(userId);
  if (!user) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req,
        "updateCompanyProfileHandler",
        "User not found",
        DATA_NOT_FOUND,
        "Your profile could not be found.",
        "USER_MANAGEMENT"
      )
    });
  }

  if (user.role !== "employer") {
    return SendErrorResponse.forbidden({
      res,
      ...buildErrorPayload(
        req,
        "updateCompanyProfileHandler",
        "Invalid user role",
        INCORRECT_INPUT,
        "Only employers can update company profiles.",
        "USER_MANAGEMENT"
      )
    });
  }

  const updatedUser = await UserService.updateUserById(userId, {
    companyProfile: payload
  });

  return SendSuccessResponse.success({
    res,
    message: "Company profile updated successfully!",
    data: updatedUser
  });
}

// Change password
export async function changePasswordHandler(req: Request, res: Response) {
  const userId = res.locals.user?.id;
  const payload: ChangePasswordDto = req.body;

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req,
        "changePasswordHandler",
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to change your password.",
        "USER_MANAGEMENT"
      )
    });
  }

  // Get user with password
  const user = await UserService.findUserByIdWithPassword(userId);
  if (!user) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req,
        "changePasswordHandler",
        "User not found",
        DATA_NOT_FOUND,
        "Your account could not be found.",
        "USER_MANAGEMENT"
      )
    });
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(payload.currentPassword, user.password);
  if (!isPasswordValid) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req,
        "changePasswordHandler",
        "Invalid password",
        INCORRECT_INPUT,
        "The current password you entered is incorrect.",
        "USER_MANAGEMENT"
      )
    });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

  // Update password
  const updatedUser = await UserService.updateUserPassword(userId, hashedPassword);

  return SendSuccessResponse.success({
    res,
    message: "Password changed successfully!",
    data: updatedUser
  });
}

// Get users by role
export async function getUsersByRoleHandler(req: Request, res: Response) {
  const { role } = req.params;
  const { page = "1", limit = "10" } = req.query;

  if (!role) {
    return SendErrorResponse.badRequest({
      res,
      ...buildErrorPayload(
        req,
        "getUsersByRoleHandler",
        "Role parameter required",
        INPUT_MISSING,
        "Role parameter is required in the URL.",
        "USER_MANAGEMENT"
      )
    });
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const [total, users] = await Promise.all([
    UserService.countUsersByRole(role),
    UserService.findUsersByRole(role, pageNum, limitNum)
  ]);

  return SendSuccessResponse.success({
    res,
    message: `${role} users retrieved successfully!`,
    data: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      items: users
    }
  });
}

// Get current user profile
export async function getCurrentUserHandler(req: Request, res: Response) {
  const userId = res.locals.user?.id;

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req,
        "getCurrentUserHandler",
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to access your profile.",
        "USER_MANAGEMENT"
      )
    });
  }

  const user = await UserService.findUserById(userId);

  if (!user) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req,
        "getCurrentUserHandler",
        "User not found",
        DATA_NOT_FOUND,
        "Your profile could not be found.",
        "USER_MANAGEMENT"
      )
    });
  }

  return SendSuccessResponse.success({
    res,
    message: "Profile retrieved successfully!",
    data: user
  });
}

// Search users by skills
export async function searchUsersBySkillsHandler(req: Request, res: Response) {
  const { skills } = req.body;
  const { page = "1", limit = "10" } = req.query;

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return SendErrorResponse.badRequest({
      res,
      ...buildErrorPayload(
        req,
        "searchUsersBySkillsHandler",
        "Skills required",
        INPUT_MISSING,
        "Please provide at least one skill to search.",
        "USER_MANAGEMENT"
      )
    });
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const users = await UserService.findUsersBySkills(skills, pageNum, limitNum);

  return SendSuccessResponse.success({
    res,
    message: "Users with matching skills retrieved successfully!",
    data: {
      page: pageNum,
      limit: limitNum,
      items: users
    }
  });
}

// Get employers by industry
export async function getEmployersByIndustryHandler(req: Request, res: Response) {
  const { industry } = req.params;
  const { page = "1", limit = "10" } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const employers = await UserService.findEmployersByIndustry(industry, pageNum, limitNum);

  return SendSuccessResponse.success({
    res,
    message: `Employers in ${industry} industry retrieved successfully!`,
    data: {
      page: pageNum,
      limit: limitNum,
      items: employers
    }
  });
}
