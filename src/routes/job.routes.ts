import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { validate } from '../middleware/validate.middleware';
import { createJobSchema, updateJobSchema, getJobsQuerySchema } from '../schemas/job.schema';

const router = Router();

/**
 * GET /api/v1/jobs
 * Query params handled by getJobsQuerySchema
 */
router.get('/', validate(getJobsQuerySchema, 'query'), JobController.list);

/**
 * POST /api/v1/jobs
 */
router.post('/', validate(createJobSchema), JobController.create);

/**
 * GET /api/v1/jobs/:id
 */
router.get('/:id', JobController.getOne);

/**
 * PUT /api/v1/jobs/:id
 */
router.put('/:id', validate(updateJobSchema), JobController.update);

/**
 * DELETE /api/v1/jobs/:id
 */
router.delete('/:id', JobController.remove);

export default router;
