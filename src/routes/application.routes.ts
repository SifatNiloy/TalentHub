import express from "express";

import validateResource from "../middleware/validateresource";
import {
    applicationIdSchema,
  createApplicationSchema,
  getApplicationsQuerySchema,
  updateApplicationSchema,
  updateStatusSchema,
} from "../schema/application.schema";
import asyncWrapper from "../utils/async-wrapper";
import { applyJobHandler, deleteApplicationHandler, getSingleApplicationHandler, listApplicationsHandler, updateApplicationHandler, updateApplicationStatusHandler, withdrawApplicationHandler } from "../controllers/application.controller";

const router = express.Router();

// Create (apply to a job)
router.post(
  "/create",
  validateResource(createApplicationSchema),
  asyncWrapper(applyJobHandler)
);

// Get all applications (with filters, pagination)
router.get(
  "/all",
  validateResource(getApplicationsQuerySchema,),
  asyncWrapper(listApplicationsHandler)
);

// Get single application by ID
router.get(
  "/:id",
  validateResource(applicationIdSchema),
  asyncWrapper(getSingleApplicationHandler)
);

// Update applicant-provided fields (coverLetter, resumeUrl, notes)
router.put(
  "/update/:id",
  validateResource(updateApplicationSchema),
  asyncWrapper(updateApplicationHandler)
);

// Update status (admin/employer)
router.patch(
  "/update-status/:id",
  validateResource(updateStatusSchema),
  asyncWrapper(updateApplicationStatusHandler)
);

// Withdraw application (by applicant)
router.post(
  "/withdraw/:id",
  validateResource(applicationIdSchema),
  asyncWrapper(withdrawApplicationHandler)
);

// Delete application (hard delete)
router.delete(
  "/delete/:id",
  validateResource(applicationIdSchema),
  asyncWrapper(deleteApplicationHandler)
);

export default router;
