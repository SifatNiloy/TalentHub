import { Router } from "express";
import {
  createUserHandler,
  getUserHandler,
  getAllUsersHandler,
  updateUserHandler,
  deleteUserHandler,
  updateProfileHandler,
  updateJobSeekerProfileHandler,
  updateCompanyProfileHandler,
  changePasswordHandler,
  getUsersByRoleHandler,
  getCurrentUserHandler,
  searchUsersBySkillsHandler,
  getEmployersByIndustryHandler
} from "../controllers/user.controller";
import {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  updateJobSeekerProfileSchema,
  updateCompanyProfileSchema,
  changePasswordSchema,
  paginationQuerySchema
} from "../schema/user.schema";
import asyncWrapper from "../utils/async-wrapper";
import { requireUser, validateResource } from "../middleware";

const router = Router();

// Public routes
router.post("/create", validateResource(createUserSchema), asyncWrapper(createUserHandler));
router.get("/all", validateResource(paginationQuerySchema), asyncWrapper(getAllUsersHandler));
router.get("/single/:id", asyncWrapper(getUserHandler));
router.get("/role/:role", validateResource(paginationQuerySchema), asyncWrapper(getUsersByRoleHandler));
router.get("/industry/:industry", validateResource(paginationQuerySchema), asyncWrapper(getEmployersByIndustryHandler));
router.post("/search-by-skills", asyncWrapper(searchUsersBySkillsHandler));

// Protected routes (require authentication)
router.get("/me", requireUser, asyncWrapper(getCurrentUserHandler));
router.patch("/me/profile", requireUser, validateResource(updateProfileSchema), asyncWrapper(updateProfileHandler));
router.patch("/me/job-seeker-profile", requireUser, validateResource(updateJobSeekerProfileSchema), asyncWrapper(updateJobSeekerProfileHandler));
router.patch("/me/company-profile", requireUser, validateResource(updateCompanyProfileSchema), asyncWrapper(updateCompanyProfileHandler));
router.patch("/me/change-password", requireUser, validateResource(changePasswordSchema), asyncWrapper(changePasswordHandler));

// Admin routes (you might want to add role-based middleware)
router.patch("/:id", validateResource(updateUserSchema), asyncWrapper(updateUserHandler));
router.delete("/:id", asyncWrapper(deleteUserHandler));

export default router;