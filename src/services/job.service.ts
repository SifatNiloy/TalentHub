/* eslint-disable @typescript-eslint/no-explicit-any */

import { Job, JobModel } from "../models/job.model";

export const JobService = {
  async createJob(data: Partial<Job>) {
    return await JobModel.create(data);
  },

  async getAllJobs(filters?: Record<string, any>) {
    const query: any = {};

    if (filters?.title) query.title = { $regex: filters.title, $options: "i" };
    if (filters?.location) query.location = { $regex: filters.location, $options: "i" };
    if (filters?.employmentType) query.employmentType = filters.employmentType;
    if (filters?.remote !== undefined) query.remote = filters.remote;

    if (filters?.minSalary || filters?.maxSalary) {
      query["salaryRange.min"] = { $gte: Number(filters.minSalary || 0) };
      query["salaryRange.max"] = { $lte: Number(filters.maxSalary || 9999999) };
    }

    return await JobModel.find(query).sort({ createdAt: -1 });
  },

  async getJobById(id: string) {
    return await JobModel.findById(id);
  },

  async updateJob(id: string, data: Partial<Job>) {
    return await JobModel.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteJob(id: string) {
    return await JobModel.findByIdAndDelete(id);
  },
};
