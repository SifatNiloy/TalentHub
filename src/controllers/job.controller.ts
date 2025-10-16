import { Request, Response } from "express";
import { JobService } from "../services/job.service";

export const createJobHandler = async (req: Request, res: Response) => {
  const job = await JobService.createJob(req.body);
  res.status(201).json({ success: true, data: job });
};

export const getAllJobsHandler = async (req: Request, res: Response) => {
  const jobs = await JobService.getAllJobs(req.query);
  res.status(200).json({ success: true, data: jobs });
};

export const getJobByIdHandler = async (req: Request, res: Response) => {
  const job = await JobService.getJobById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: "Job not found" });
  res.status(200).json({ success: true, data: job });
};

export const updateJobHandler = async (req: Request, res: Response) => {
  const job = await JobService.updateJob(req.params.id, req.body);
  if (!job) return res.status(404).json({ success: false, message: "Job not found" });
  res.status(200).json({ success: true, data: job });
};

export const deleteJobHandler = async (req: Request, res: Response) => {
  const job = await JobService.deleteJob(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: "Job not found" });
  res.status(200).json({ success: true, message: "Job deleted successfully" });
};
