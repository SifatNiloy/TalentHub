import { JobModel } from '../models/Job.model';
import { CompanyModel } from '../models/Company.model';
import { ApiError } from '../utils/apiError';
import mongoose from 'mongoose';

type CreateJobDto = {
  title: string;
  description?: string;
  companyId?: string;
  location: { type: 'Point'; coordinates: [number, number] };
  skills?: string[];
  salary?: { min?: number; max?: number; currency?: string };
  employmentType?: string;
  remote?: boolean;
  isActive?: boolean;
};

export const JobService = {
  async create(data: CreateJobDto) {
    if (data.companyId) {
      const exists = await CompanyModel.exists({ _id: data.companyId });
      if (!exists) throw new ApiError('Company not found', 404);
    }
    const job = await JobModel.create({
      title: data.title,
      description: data.description,
      company: data.companyId ? new mongoose.Types.ObjectId(data.companyId) : undefined,
      location: data.location,
      skills: data.skills || [],
      salary: data.salary,
      employmentType: data.employmentType,
      remote: data.remote ?? false,
      isActive: data.isActive ?? true,
      postedAt: new Date(),
    });
    return job;
  },

  async getById(id: string) {
    const job = await JobModel.findById(id).populate('company');
    if (!job) throw new ApiError('Job not found', 404);
    return job;
  },

  /**
   * filter: supports title (text), skill, employmentType, remote, pagination, sort,
   * and geo radius search if lat,lng,radiusKm passed.
   */
  async findAll(query: {
    title?: string;
    skill?: string;
    employmentType?: string;
    remote?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: any = { isActive: true };

    if (query.title) filter.title = { $regex: query.title, $options: 'i' };
    if (query.skill) filter.skills = { $in: [query.skill] };
    if (query.employmentType) filter.employmentType = query.employmentType;
    if (typeof query.remote === 'boolean') filter.remote = query.remote;

    // Geo radius search
    if (typeof query.lat === 'number' && typeof query.lng === 'number' && query.radiusKm) {
      const meters = query.radiusKm * 1000;
      filter.location = {
        $geoWithin: {
          $centerSphere: [[query.lng, query.lat], meters / 6378137], // Earth's radius in meters
        },
      };
    }

    let q = JobModel.find(filter).populate('company').skip(skip).limit(limit);

    if (query.sortBy) q = q.sort(query.sortBy);

    const [total, items] = await Promise.all([JobModel.countDocuments(filter), q.exec()]);

    return {
      total,
      page,
      limit,
      items,
    };
  },

  async update(id: string, payload: Partial<CreateJobDto>) {
    const job = await JobModel.findByIdAndUpdate(id, payload as any, { new: true });
    if (!job) throw new ApiError('Job not found', 404);
    return job;
  },

  async remove(id: string) {
    const job = await JobModel.findByIdAndDelete(id);
    if (!job) throw new ApiError('Job not found', 404);
    return job;
  },
};
