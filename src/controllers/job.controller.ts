import { Request, Response } from "express";
import { JobService } from "../services/job.service";

// Explicitly type route params
type IdParam = { id: string };

export const getJobByIdHandler = async (
  req: Request<IdParam>,
  res: Response
) => {
  const job = await JobService.getJobById(req.params.id);
  if (!job)
    return res.status(404).json({ success: false, message: "Job not found" });
  res.status(200).json({ success: true, data: job });
};
// ✅ Create a new job
export const createJobHandler = async (req: Request, res: Response) => {
  const job = await JobService.createJob(req.body);
  return res.status(201).json({
    success: true,
    message: "Job created successfully",
    data: job,
  });
};

// ✅ Get all jobs (supports filters)
export const getAllJobsHandler = async (req: Request, res: Response) => {
  const jobs = await JobService.getAllJobs(req.query);
  return res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
  });
};

export const updateJobHandler = async (
  req: Request<IdParam>,
  res: Response
) => {
  const job = await JobService.updateJob(req.params.id, req.body);
  if (!job)
    return res.status(404).json({ success: false, message: "Job not found" });
  res.status(200).json({ success: true, data: job });
};

export const deleteJobHandler = async (
  req: Request<IdParam>,
  res: Response
) => {
  const job = await JobService.deleteJob(req.params.id);
  if (!job)
    return res.status(404).json({ success: false, message: "Job not found" });
  res
    .status(200)
    .json({ success: true, message: "Job deleted successfully" });
};
