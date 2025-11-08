import { Router } from "express";
import {
  createJobHandler,
  getAllJobsHandler,
  getJobByIdHandler,
  updateJobHandler,
  deleteJobHandler,
  getMyJobsHandler,
  getSimilarJobsHandler,
  getJobsByLocationHandler,
  searchJobsByTagsHandler,
  updateExpiredJobsHandler,
  getJobStatsHandler
} from "../controllers/job.controller";
import {
  createJobSchema,
  updateJobSchema,
  jobIdSchema,
  jobQuerySchema
} from "../schema/job.schema";
import { asyncWrapper, requireUser, requireRole, validateResource } from "../middleware";
import { UserRole } from "../constants/user.constant";

const router = Router();

// Public routes
router.get("/all", validateResource(jobQuerySchema), asyncWrapper(getAllJobsHandler));
router.get("/single/:id", validateResource(jobIdSchema), asyncWrapper(getJobByIdHandler));
router.get("/location/:location", asyncWrapper(getJobsByLocationHandler));
router.get("/similar/:id", validateResource(jobIdSchema), asyncWrapper(getSimilarJobsHandler));
router.post("/search-by-tags", asyncWrapper(searchJobsByTagsHandler));

// Protected routes (authenticated users)
router.post(
  "/create",
  requireUser,
  requireRole(UserRole.EMPLOYER, UserRole.ADMIN),
  validateResource(createJobSchema),
  asyncWrapper(createJobHandler)
);
router.get("/my-jobs", requireUser, asyncWrapper(getMyJobsHandler));
router.get("/stats", requireUser, asyncWrapper(getJobStatsHandler));

router.patch(
  "/update/:id",
  requireUser,
  validateResource(updateJobSchema),
  asyncWrapper(updateJobHandler)
);

router.delete(
  "/delete/:id",
  requireUser,
  validateResource(jobIdSchema),
  asyncWrapper(deleteJobHandler)
);

// Admin only routes
router.patch(
  "/expired/update",
  requireUser,
  requireRole(UserRole.ADMIN),
  asyncWrapper(updateExpiredJobsHandler)
);

export default router;