/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import { JobService } from '../services/job.service';

export const JobController = {
  async create(req: Request, res: Response) {
    const payload = req.body;
    const job = await JobService.create(payload);
    res.status(201).json(job);
  },

  async list(req: Request, res: Response) {
    const q = req.query as any;
    const result = await JobService.findAll(q);
    res.json(result);
  },

  async getOne(req: Request, res: Response) {
    const { id } = req.params;
    const job = await JobService.getById(id);
    res.json(job);
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const job = await JobService.update(id, req.body);
    res.json(job);
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const job = await JobService.remove(id);
    res.status(204).send();
  },
};
