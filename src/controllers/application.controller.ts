import { Request, Response } from "express";
import { ApplicationService } from "../services/application.service";

// Apply to a job
export const applyJobHandler = async (req: Request, res: Response) => {
  const payload = req.body;
  const application = await ApplicationService.apply(payload);
  res.status(201).json({ success: true, data: application });
};

// Get all applications (with filters & pagination)
export const listApplicationsHandler = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = req.query as Record<string, any>;
  const result = await ApplicationService.findAll(q);
  res.status(200).json({ success: true, data: result });
};

// Get single application by ID
export const getSingleApplicationHandler = async (req: Request, res: Response) => {
  const id = req.params.id!;
  const app = await ApplicationService.getById(id);
  res.status(200).json({ success: true, data: app });
};

// Update applicant-provided fields
export const updateApplicationHandler = async (req: Request, res: Response) => {
  const id = req.params.id!;
  const app = await ApplicationService.update(id, req.body);
  res.status(200).json({ success: true, data: app });
};

// Update application status
export const updateApplicationStatusHandler = async (req: Request, res: Response) => {
  const id = req.params.id!;
  const { status, notes } = req.body;
  const app = await ApplicationService.updateStatus(id, status, notes);
  res.status(200).json({ success: true, data: app });
};

// Withdraw application
export const withdrawApplicationHandler = async (req: Request, res: Response) => {
  const id = req.params.id!;
  const app = await ApplicationService.withdraw(id);
  res.status(200).json({ success: true, data: app });
};

// Hard delete (admin only)
export const deleteApplicationHandler = async (req: Request, res: Response) => {
  const id = req.params.id!;
  await ApplicationService.hardDelete(id);
  res.status(200).json({ success: true, message: "Application deleted successfully" });
};
