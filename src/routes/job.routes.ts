import express from "express";
import {
  createJobHandler,
  getAllJobsHandler,
  getJobByIdHandler,
  updateJobHandler,
  deleteJobHandler,
} from "../controllers/job.controller";
import validateResource from "../middleware/validateresource";
import { createJobSchema, jobIdSchema, updateJobSchema } from "../schema/job.schema";
import asyncWrapper from "../utils/async-wrapper";

const router = express.Router();

// Create a new job
router.post(
  "/create",
  validateResource(createJobSchema),
  asyncWrapper(createJobHandler)
);

// Get all jobs (with filters)
router.get("/all", asyncWrapper(getAllJobsHandler));

// Get a single job
router.get(
  "/:id",
  validateResource(jobIdSchema),
  asyncWrapper(getJobByIdHandler)
);

// Update a job
router.put(
  "/update/:id",
  validateResource(updateJobSchema),
  asyncWrapper(updateJobHandler)
);

// Delete a job
router.delete(
  "/delete/:id",
  validateResource(jobIdSchema),
  asyncWrapper(deleteJobHandler)
);

export default router;
