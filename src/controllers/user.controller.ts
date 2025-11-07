import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import * as UserService from "../services/user.service";
import { CreateUserDto, UpdateUserDto, UpdateProfileDto, UpdateJobSeekerProfileDto, UpdateCompanyProfileDto, ChangePasswordDto } from "../schema/user.schema";
import { SendResponse } from "../utils/send-response";
import { SendErrorResponse } from "../utils/send-error-response";
import { INPUT_MISSING, INCORRECT_INPUT, DATA_NOT_FOUND, UNAUTHORIZED, ALREADY_EXISTS } from "../constants/error-codes";

const SYSTEM_CURRENT_FEATURES = {
  USER_MANAGEMENT: "USER_MANAGEMENT"
};

function buildErrorPayload(
  endpoint: string,
  functionName: string,
  method: string,
  message: string,
  error: { code: string; message: string },
  customMsg: string
) {
  return {
    message,
    data: {
      clientError: { ...error, message: customMsg },
      endpoint,
      functionName,
      method,
      service: SYSTEM_CURRENT_FEATURES.USER_MANAGEMENT,
      id: uuid()
    }
  };
}

// Create a new user
export async function createUserHandler(req: Request, res: Response) {
  const functionName = createUserHandler.name;
  const payload: CreateUserDto = req.body;

  // Check if user already exists
  const existingUser = await UserService.findUserByEmail(payload.email);
  if (existingUser) {
    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Email already registered",
        ALREADY_EXISTS,
        "This email address is already registered. Please use a different email or login to your existing account."
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
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Failed to create user",
        DATA_NOT_FOUND,
        "Unable to create user account. Please try again later or contact support."
      )
    });
  }

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return SendResponse.created({
    res,
    message: "User created successfully!",
    data: userResponse
  });
}

// Get a single user by ID
export async function getUserHandler(req: Request, res: Response) {
  const functionName = getUserHandler.name;
  const { id } = req.params;

  const user = await UserService.findUserById(id);

  if (!user) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "User not found",
        DATA_NOT_FOUND,
        "The requested user could not be found. Please check the user ID and try again."
      )
    });
  }

  // Increment profile views
  await UserService.incrementProfileViews(id);

  return SendResponse.success({
    res,
    message: "User retrieved successfully!",
    data: user
  });
}

// Get all users with filtering & pagination
export async function getAllUsersHandler(req: Request, res: Response) {
  const functionName = getAllUsersHandler.name;
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

  return SendResponse.success({
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
  const functionName = updateUserHandler.name;
  const { id } = req.params;
  const payload: UpdateUserDto = req.body;

  // Check if user exists
  const existingUser = await UserService.findUserById(id);
  if (!existingUser) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "User not found",
        DATA_NOT_FOUND,
        "The user you're trying to update could not be found."
      )
    });
  }

  // If email is being updated, check if it's already taken
  if (payload.email && payload.email !== existingUser.email) {
    const emailExists = await UserService.findUserByEmail(payload.email);
    if (emailExists) {
      return SendErrorResponse.error({
        res,
        ...buildErrorPayload(
          req.originalUrl,
          functionName,
          req.method.toUpperCase(),
          "Email already in use",
          ALREADY_EXISTS,
          "This email address is already registered to another account."
        )
      });
    }
  }

  // Remove undefined fields
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  );

  const updatedUser = await UserService.updateUserById(id, cleanPayload);

  return SendResponse.success({
    res,
    message: "User updated successfully!",
    data: updatedUser
  });
}

// Delete a user by ID
export async function deleteUserHandler(req: Request, res: Response) {
  const functionName = deleteUserHandler.name;
  const { id } = req.params;

  const user = await UserService.deleteUserById(id);

  if (!user) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "User not found",
        DATA_NOT_FOUND,
        "The user you're trying to delete could not be found."
      )
    });
  }

  return SendResponse.success({
    res,
    message: "User deleted successfully!",
    data: user
  });
}

// Update user profile (self-update)
export async function updateProfileHandler(req: Request, res: Response) {
  const functionName = updateProfileHandler.name;
  const userId = res.locals.user?.id; // Assuming you have authentication middleware
  const payload: UpdateProfileDto = req.body;

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to update your profile."
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
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "User not found",
        DATA_NOT_FOUND,
        "Your profile could not be found."
      )
    });
  }

  return SendResponse.success({
    res,
    message: "Profile updated successfully!",
    data: updatedUser
  });
}

// Update job seeker profile
export async function updateJobSeekerProfileHandler(req: Request, res: Response) {
  const functionName = updateJobSeekerProfileHandler.name;
  const userId = res.locals.user?.id;
  const payload: UpdateJobSeekerProfileDto = req.body;

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to update your profile."
      )
    });
  }

  // Check if user is a job seeker
  const user = await UserService.findUserById(userId);
  if (!user) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "User not found",
        DATA_NOT_FOUND,
        "Your profile could not be found."
      )
    });
  }

  if (user.role !== "job_seeker") {
    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Invalid user role",
        INCORRECT_INPUT,
        "Only job seekers can update job seeker profiles."
      )
    });
  }

  const updatedUser = await UserService.updateUserById(userId, {
    jobSeekerProfile: payload
  });

  return SendResponse.success({
    res,
    message: "Job seeker profile updated successfully!",
    data: updatedUser
  });
}

// Update company profile
export async function updateCompanyProfileHandler(req: Request, res: Response) {
  const functionName = updateCompanyProfileHandler.name;
  const userId = res.locals.user?.id;
  const payload: UpdateCompanyProfileDto = req.body;

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to update your company profile."
      )
    });
  }

  // Check if user is an employer
  const user = await UserService.findUserById(userId);
  if (!user) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "User not found",
        DATA_NOT_FOUND,
        "Your profile could not be found."
      )
    });
  }

  if (user.role !== "employer") {
    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Invalid user role",
        INCORRECT_INPUT,
        "Only employers can update company profiles."
      )
    });
  }

  const updatedUser = await UserService.updateUserById(userId, {
    companyProfile: payload
  });

  return SendResponse.success({
    res,
    message: "Company profile updated successfully!",
    data: updatedUser
  });
}

// Change password
export async function changePasswordHandler(req: Request, res: Response) {
  const functionName = changePasswordHandler.name;
  const userId = res.locals.user?.id;
  const payload: ChangePasswordDto = req.body;

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to change your password."
      )
    });
  }

  // Get user with password
  const user = await UserService.findUserByIdWithPassword(userId);
  if (!user) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "User not found",
        DATA_NOT_FOUND,
        "Your account could not be found."
      )
    });
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(payload.currentPassword, user.password);
  if (!isPasswordValid) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Invalid password",
        INCORRECT_INPUT,
        "The current password you entered is incorrect."
      )
    });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

  // Update password
  const updatedUser = await UserService.updateUserPassword(userId, hashedPassword);

  return SendResponse.success({
    res,
    message: "Password changed successfully!",
    data: updatedUser
  });
}

// Get users by role
export async function getUsersByRoleHandler(req: Request, res: Response) {
  const functionName = getUsersByRoleHandler.name;
  const { role } = req.params;
  const { page = "1", limit = "10" } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const [total, users] = await Promise.all([
    UserService.countUsersByRole(role),
    UserService.findUsersByRole(role, pageNum, limitNum)
  ]);

  return SendResponse.success({
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

// Get current user profile (authenticated user)
export async function getCurrentUserHandler(req: Request, res: Response) {
  const functionName = getCurrentUserHandler.name;
  const userId = res.locals.user?.id;

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to access your profile."
      )
    });
  }

  const user = await UserService.findUserById(userId);

  if (!user) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "User not found",
        DATA_NOT_FOUND,
        "Your profile could not be found."
      )
    });
  }

  return SendResponse.success({
    res,
    message: "Profile retrieved successfully!",
    data: user
  });
}

// Search users by skills
export async function searchUsersBySkillsHandler(req: Request, res: Response) {
  const functionName = searchUsersBySkillsHandler.name;
  const { skills } = req.body; // Expecting array of skill names
  const { page = "1", limit = "10" } = req.query;

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Skills required",
        INPUT_MISSING,
        "Please provide at least one skill to search."
      )
    });
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const users = await UserService.findUsersBySkills(skills, pageNum, limitNum);

  return SendResponse.success({
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
  // const functionName = getEmployersByIndustryHandler.name;
  const { industry } = req.params;
  const { page = "1", limit = "10" } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const employers = await UserService.findEmployersByIndustry(industry, pageNum, limitNum);

  return SendResponse.success({
    res,
    message: `Employers in ${industry} industry retrieved successfully!`,
    data: {
      page: pageNum,
      limit: limitNum,
      items: employers
    }
  });
}