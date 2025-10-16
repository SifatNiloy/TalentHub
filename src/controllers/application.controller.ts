import { Request, Response } from 'express';
import { ApplicationService } from '../services/application.service';

export const ApplicationController = {
  async apply(req: Request, res: Response) {
    const payload = req.body;
    const application = await ApplicationService.apply(payload);
    res.status(201).json(application);
  },

  async list(req: Request, res: Response) {
    const q = req.query as any;
    const result = await ApplicationService.findAll(q);
    res.json(result);
  },

  async getOne(req: Request, res: Response) {
    const { id } = req.params;
    const app = await ApplicationService.getById(id);
    res.json(app);
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const app = await ApplicationService.update(id, req.body);
    res.json(app);
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, notes } = req.body;
    const app = await ApplicationService.updateStatus(id, status, notes);
    res.json(app);
  },

  async withdraw(req: Request, res: Response) {
    const { id } = req.params;
    const app = await ApplicationService.withdraw(id);
    res.json(app);
  },

  // optional: hard delete (admin only - we expose but you can remove)
  async remove(req: Request, res: Response) {
    const { id } = req.params;
    await ApplicationService.hardDelete(id);
    res.status(204).send();
  },
};
