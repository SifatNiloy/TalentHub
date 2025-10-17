/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationModel } from "../models/application.model";
import { JobModel } from "../models/job.model";
import { UserModel } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import mongoose from "mongoose";

type CreateApplicationDto = {
  jobId: string;
  applicantId: string;
  coverLetter?: string;
  resumeUrl?: string;
};

export const ApplicationService = {
  async apply(payload: CreateApplicationDto) {
    const job = await JobModel.findById(payload.jobId);
    if (!job) throw new ApiError("Job not found", 404);

    const user = await UserModel.findById(payload.applicantId);
    if (!user) throw new ApiError("Applicant not found", 404);

    const existing = await ApplicationModel.exists({
      job: payload.jobId,
      applicant: payload.applicantId,
    });
    if (existing) throw new ApiError("Applicant already applied to this job", 400);

    const app = await ApplicationModel.create({
      job: new mongoose.Types.ObjectId(payload.jobId),
      applicant: new mongoose.Types.ObjectId(payload.applicantId),
      coverLetter: payload.coverLetter,
      resumeUrl: payload.resumeUrl ?? (user as any).resumeUrl,
      status: "pending",
      appliedAt: new Date(),
    });

    return await app.populate(["job", "applicant"]);
  },

  async getById(id: string) {
    const app = await ApplicationModel.findById(id)
      .populate("job")
      .populate("applicant");
    if (!app) throw new ApiError("Application not found", 404);
    return app;
  },

  async findAll(query: {
    jobId?: string;
    applicantId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.jobId) filter.job = query.jobId;
    if (query.applicantId) filter.applicant = query.applicantId;
    if (query.status) filter.status = query.status;

    const q = ApplicationModel.find(filter)
      .populate("job")
      .populate("applicant")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const [total, items] = await Promise.all([
      ApplicationModel.countDocuments(filter),
      q.exec(),
    ]);

    return { total, page, limit, items };
  },

  async update(
    id: string,
    payload: Partial<{ coverLetter?: string; resumeUrl?: string; notes?: string }>
  ) {
    const app = await ApplicationModel.findByIdAndUpdate(id, payload, {
      new: true,
    })
      .populate("job")
      .populate("applicant");
    if (!app) throw new ApiError("Application not found", 404);
    return app;
  },

  async updateStatus(id: string, status: string, notes?: string) {
    const app = await ApplicationModel.findById(id);
    if (!app) throw new ApiError("Application not found", 404);

    app.status = status as any;
    if (notes) app.notes = notes;
    await app.save();

    return await app.populate(["job", "applicant"]);
  },

  async withdraw(id: string) {
    const app = await ApplicationModel.findById(id);
    if (!app) throw new ApiError("Application not found", 404);

    app.status = "withdrawn";
    await app.save();
    return await app.populate(["job", "applicant"]);
  },

  async hardDelete(id: string) {
    const app = await ApplicationModel.findByIdAndDelete(id);
    if (!app) throw new ApiError("Application not found", 404);
    return app;
  },
};
