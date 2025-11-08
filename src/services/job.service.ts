/* eslint-disable @typescript-eslint/no-explicit-any */
import { JobModel } from "../models/job.model";
import { FilterQuery } from "mongoose";
import { Job } from "../models/job.model";

export async function createJob(payload: any) {
  return JobModel.create(payload);
}

export async function findJobById(id: string) {
  return JobModel.findById(id).populate("postedBy", "name email company profileImageUrl");
}

export async function findAllJobs(
  filter: FilterQuery<Job>,
  page: number,
  limit: number,
  searchQuery?: string
) {
  const query: any = { ...filter };

  // Text search
  if (searchQuery) {
    query.$or = [
      { title: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
      { "company.name": { $regex: searchQuery, $options: "i" } },
      { location: { $regex: searchQuery, $options: "i" } }
    ];
  }

  return JobModel.find(query)
    .populate("postedBy", "name email companyProfile.companyName profileImageUrl")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function countJobs(filter: FilterQuery<Job>, searchQuery?: string) {
  const query: any = { ...filter };

  if (searchQuery) {
    query.$or = [
      { title: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
      { "company.name": { $regex: searchQuery, $options: "i" } },
      { location: { $regex: searchQuery, $options: "i" } }
    ];
  }

  return JobModel.countDocuments(query);
}

export async function updateJobById(id: string, payload: any) {
  return JobModel.findByIdAndUpdate(id, payload, { new: true }).populate(
    "postedBy",
    "name email companyProfile.companyName"
  );
}

export async function deleteJobById(id: string) {
  return JobModel.findByIdAndDelete(id);
}

export async function incrementJobViews(id: string) {
  return JobModel.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
}

export async function incrementApplicationCount(id: string) {
  return JobModel.findByIdAndUpdate(id, { $inc: { applicationsCount: 1 } }, { new: true });
}

export async function decrementApplicationCount(id: string) {
  return JobModel.findByIdAndUpdate(id, { $inc: { applicationsCount: -1 } }, { new: true });
}

export async function findJobsByEmployer(employerId: string, page: number, limit: number) {
  return JobModel.find({ postedBy: employerId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function countJobsByEmployer(employerId: string) {
  return JobModel.countDocuments({ postedBy: employerId });
}

export async function findJobsByStatus(status: string, page: number, limit: number) {
  return JobModel.find({ status })
    .populate("postedBy", "name email companyProfile.companyName")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function findJobsByLocation(location: string, page: number, limit: number) {
  return JobModel.find({ location: { $regex: location, $options: "i" } })
    .populate("postedBy", "name email companyProfile.companyName")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function findJobsByTags(tags: string[], page: number, limit: number) {
  return JobModel.find({ tags: { $in: tags } })
    .populate("postedBy", "name email companyProfile.companyName")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function findSimilarJobs(jobId: string, limit: number = 5) {
  const job = await JobModel.findById(jobId);
  if (!job) return [];

  return JobModel.find({
    _id: { $ne: jobId },
    $or: [
      { employmentType: job.employmentType },
      { location: job.location },
      { tags: { $in: job.tags || [] } }
    ],
    status: "active"
  })
    .limit(limit)
    .populate("postedBy", "name email companyProfile.companyName");
}

export async function findExpiredJobs() {
  return JobModel.find({
    expiresAt: { $lt: new Date() },
    status: "active"
  });
}

export async function updateExpiredJobs() {
  return JobModel.updateMany(
    {
      expiresAt: { $lt: new Date() },
      status: "active"
    },
    { status: "expired" }
  );
}

// Optional: Create additional indexes (call this once during setup)
export async function createJobIndexes() {
  try {
    await JobModel.collection.createIndex(
      { title: "text", description: "text", "company.name": "text" },
      { name: "job_text_search" }
    );
    await JobModel.collection.createIndex({ employmentType: 1 });
    await JobModel.collection.createIndex({ expiresAt: 1 });
    console.log("✅ Job indexes created successfully");
  } catch (error) {
    console.error("❌ Error creating job indexes:", error);
  }
}
