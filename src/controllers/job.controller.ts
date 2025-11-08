/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import * as JobService from "../services/job.service";
import { CreateJobDto, UpdateJobDto } from "../schema/job.schema";
import { SendSuccessResponse, SendErrorResponse } from "../utils/responseHandler";
import { DATA_NOT_FOUND, UNAUTHORIZED, FORBIDDEN } from "../constants/error-codes";
import { buildErrorPayload } from "../middleware/helpers";

// Create a new job
export async function createJobHandler(req: Request, res: Response) {
  const payload: CreateJobDto = req.body;
  const userId = res.locals.user?.id;

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req,
        "createJobHandler",
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to create a job posting.",
        "JOB_MANAGEMENT"
      )
    });
  }

  // Add postedBy field
  const jobData = {
    ...payload,
    postedBy: userId,
    publishedAt: new Date()
  };

  const job = await JobService.createJob(jobData);

  if (!job) {
    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req,
        "createJobHandler",
        "Failed to create job",
        DATA_NOT_FOUND,
        "Unable to create job posting. Please try again later.",
        "JOB_MANAGEMENT"
      )
    });
  }

  return SendSuccessResponse.created({
    res,
    message: "Job created successfully!",
    data: job
  });
}

// Get all jobs with filters and pagination
export async function getAllJobsHandler(req: Request, res: Response) {
  const {
    page = "1",
    limit = "10",
    title,
    location,
    employmentType,
    experienceLevel,
    status,
    remote,
    minSalary,
    maxSalary,
    search,
    tags
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // Build filter
  const filter: any = {};
  if (title) filter.title = { $regex: title, $options: "i" };
  if (location) filter.location = { $regex: location, $options: "i" };
  if (employmentType) filter.employmentType = employmentType;
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  if (status) filter.status = status;
  if (remote) filter.remote = remote === "true";
  if (tags) {
    const tagArray = (tags as string).split(",").map((t) => t.trim());
    filter.tags = { $in: tagArray };
  }

  // Salary range filter
  if (minSalary || maxSalary) {
    filter["salaryRange.min"] = { $gte: Number(minSalary || 0) };
    filter["salaryRange.max"] = { $lte: Number(maxSalary || 999999999) };
  }

  const [total, jobs] = await Promise.all([
    JobService.countJobs(filter, search as string),
    JobService.findAllJobs(filter, pageNum, limitNum, search as string)
  ]);

  return SendSuccessResponse.success({
    res,
    message: "Jobs retrieved successfully!",
    data: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      items: jobs
    }
  });
}

// Get a single job by ID
export async function getJobByIdHandler(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return SendErrorResponse.badRequest({
      res,
      ...buildErrorPayload(
        req,
        "getJobByIdHandler",
        "Job ID required",
        DATA_NOT_FOUND,
        "Job ID parameter is required.",
        "JOB_MANAGEMENT"
      )
    });
  }

  const job = await JobService.findJobById(id);

  if (!job) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req,
        "getJobByIdHandler",
        "Job not found",
        DATA_NOT_FOUND,
        "The requested job could not be found. It may have been removed or expired.",
        "JOB_MANAGEMENT"
      )
    });
  }

  // Increment views
  await JobService.incrementJobViews(id);

  return SendSuccessResponse.success({
    res,
    message: "Job retrieved successfully!",
    data: job
  });
}

// Update a job by ID
export async function updateJobHandler(req: Request, res: Response) {
  const { id } = req.params;
  const payload: UpdateJobDto = req.body;
  const userId = res.locals.user?.id;
  const userRole = res.locals.user?.role;

  if (!id) {
    return SendErrorResponse.badRequest({
      res,
      ...buildErrorPayload(
        req,
        "updateJobHandler",
        "Job ID required",
        DATA_NOT_FOUND,
        "Job ID parameter is required.",
        "JOB_MANAGEMENT"
      )
    });
  }

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req,
        "updateJobHandler",
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to update a job.",
        "JOB_MANAGEMENT"
      )
    });
  }

  // Check if job exists
  const existingJob = await JobService.findJobById(id);
  if (!existingJob) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req,
        "updateJobHandler",
        "Job not found",
        DATA_NOT_FOUND,
        "The job you're trying to update could not be found.",
        "JOB_MANAGEMENT"
      )
    });
  }

  // Check ownership (unless admin)
  if (userRole !== "admin" && existingJob.postedBy?.toString() !== userId) {
    return SendErrorResponse.forbidden({
      res,
      ...buildErrorPayload(
        req,
        "updateJobHandler",
        "Access denied",
        FORBIDDEN,
        "You don't have permission to update this job posting.",
        "JOB_MANAGEMENT"
      )
    });
  }

  // Remove undefined fields
  const cleanPayload = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  );

  const updatedJob = await JobService.updateJobById(id, cleanPayload);

  return SendSuccessResponse.success({
    res,
    message: "Job updated successfully!",
    data: updatedJob
  });
}

// Delete a job by ID
export async function deleteJobHandler(req: Request, res: Response) {
  const { id } = req.params;
  const userId = res.locals.user?.id;
  const userRole = res.locals.user?.role;

  if (!id) {
    return SendErrorResponse.badRequest({
      res,
      ...buildErrorPayload(
        req,
        "deleteJobHandler",
        "Job ID required",
        DATA_NOT_FOUND,
        "Job ID parameter is required.",
        "JOB_MANAGEMENT"
      )
    });
  }

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req,
        "deleteJobHandler",
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to delete a job.",
        "JOB_MANAGEMENT"
      )
    });
  }

  // Check if job exists
  const existingJob = await JobService.findJobById(id);
  if (!existingJob) {
    return SendErrorResponse.notFound({
      res,
      ...buildErrorPayload(
        req,
        "deleteJobHandler",
        "Job not found",
        DATA_NOT_FOUND,
        "The job you're trying to delete could not be found.",
        "JOB_MANAGEMENT"
      )
    });
  }

  // Check ownership (unless admin)
  if (userRole !== "admin" && existingJob.postedBy?.toString() !== userId) {
    return SendErrorResponse.forbidden({
      res,
      ...buildErrorPayload(
        req,
        "deleteJobHandler",
        "Access denied",
        FORBIDDEN,
        "You don't have permission to delete this job posting.",
        "JOB_MANAGEMENT"
      )
    });
  }

  await JobService.deleteJobById(id);

  return SendSuccessResponse.success({
    res,
    message: "Job deleted successfully!",
    data: { id }
  });
}

// Get jobs posted by employer
export async function getMyJobsHandler(req: Request, res: Response) {
  const userId = res.locals.user?.id;
  const { page = "1", limit = "10" } = req.query;

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req,
        "getMyJobsHandler",
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to view your jobs.",
        "JOB_MANAGEMENT"
      )
    });
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const [total, jobs] = await Promise.all([
    JobService.countJobsByEmployer(userId),
    JobService.findJobsByEmployer(userId, pageNum, limitNum)
  ]);

  return SendSuccessResponse.success({
    res,
    message: "Your jobs retrieved successfully!",
    data: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      items: jobs
    }
  });
}

// Get similar jobs
export async function getSimilarJobsHandler(req: Request, res: Response) {
  const { id } = req.params;
  const { limit = "5" } = req.query;

  if (!id) {
    return SendErrorResponse.badRequest({
      res,
      ...buildErrorPayload(
        req,
        "getSimilarJobsHandler",
        "Job ID required",
        DATA_NOT_FOUND,
        "Job ID parameter is required.",
        "JOB_MANAGEMENT"
      )
    });
  }

  const limitNum = parseInt(limit as string, 10);
  const similarJobs = await JobService.findSimilarJobs(id, limitNum);

  return SendSuccessResponse.success({
    res,
    message: "Similar jobs retrieved successfully!",
    data: similarJobs
  });
}

// Get jobs by location
export async function getJobsByLocationHandler(req: Request, res: Response) {
  const { location } = req.params;
  const { page = "1", limit = "10" } = req.query;

  if (!location) {
    return SendErrorResponse.badRequest({
      res,
      ...buildErrorPayload(
        req,
        "getJobsByLocationHandler",
        "Location required",
        DATA_NOT_FOUND,
        "Location parameter is required.",
        "JOB_MANAGEMENT"
      )
    });
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const jobs = await JobService.findJobsByLocation(location, pageNum, limitNum);

  return SendSuccessResponse.success({
    res,
    message: `Jobs in ${location} retrieved successfully!`,
    data: {
      page: pageNum,
      limit: limitNum,
      items: jobs
    }
  });
}

// Search jobs by tags
export async function searchJobsByTagsHandler(req: Request, res: Response) {
  const { tags } = req.body;
  const { page = "1", limit = "10" } = req.query;

  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return SendErrorResponse.badRequest({
      res,
      ...buildErrorPayload(
        req,
        "searchJobsByTagsHandler",
        "Tags required",
        DATA_NOT_FOUND,
        "Please provide at least one tag to search.",
        "JOB_MANAGEMENT"
      )
    });
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const jobs = await JobService.findJobsByTags(tags, pageNum, limitNum);

  return SendSuccessResponse.success({
    res,
    message: "Jobs with matching tags retrieved successfully!",
    data: {
      page: pageNum,
      limit: limitNum,
      items: jobs
    }
  });
}

// Update expired jobs (can be called by cron job)
export async function updateExpiredJobsHandler(req: Request, res: Response) {
  const userRole = res.locals.user?.role;

  // Only admin can trigger this
  if (userRole !== "admin") {
    return SendErrorResponse.forbidden({
      res,
      ...buildErrorPayload(
        req,
        "updateExpiredJobsHandler",
        "Access denied",
        FORBIDDEN,
        "Only administrators can perform this action.",
        "JOB_MANAGEMENT"
      )
    });
  }

  const result = await JobService.updateExpiredJobs();

  return SendSuccessResponse.success({
    res,
    message: "Expired jobs updated successfully!",
    data: result
  });
}

// Get job statistics (for employer dashboard)
export async function getJobStatsHandler(req: Request, res: Response) {
  const userId = res.locals.user?.id;

  if (!userId) {
    return SendErrorResponse.unauthorized({
      res,
      ...buildErrorPayload(
        req,
        "getJobStatsHandler",
        "Unauthorized",
        UNAUTHORIZED,
        "You must be logged in to view statistics.",
        "JOB_MANAGEMENT"
      )
    });
  }

  const total = await JobService.countJobsByEmployer(userId);
  const jobs = await JobService.findJobsByEmployer(userId, 1, 1000);

  const stats = {
    total,
    active: jobs.filter((j: any) => j.status === "active").length,
    closed: jobs.filter((j: any) => j.status === "closed").length,
    draft: jobs.filter((j: any) => j.status === "draft").length,
    totalViews: jobs.reduce((sum: number, j: any) => sum + (j.views || 0), 0),
    totalApplications: jobs.reduce((sum: number, j: any) => sum + (j.applicationsCount || 0), 0)
  };

  return SendSuccessResponse.success({
    res,
    message: "Job statistics retrieved successfully!",
    data: stats
  });
}