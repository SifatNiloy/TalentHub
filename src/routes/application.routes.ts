import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { validate } from '../middleware/validate.middleware';
import { createApplicationSchema, updateApplicationSchema, getApplicationsQuerySchema, updateStatusSchema } from '../schemas/application.schema';

const router = Router();

/**
 * POST /api/v1/applications
 * body: { jobId, applicantId, coverLetter?, resumeUrl? }
 */
router.post('/', validate(createApplicationSchema), ApplicationController.apply);

/**
 * GET /api/v1/applications
 * query params: jobId, applicantId, status, page, limit
 */
router.get('/', validate(getApplicationsQuerySchema, 'query'), ApplicationController.list);

/**
 * GET /api/v1/applications/:id
 */
router.get('/:id', ApplicationController.getOne);

/**
 * PUT /api/v1/applications/:id
 * update applicant-provided fields (coverLetter, resumeUrl, notes)
 */
router.put('/:id', validate(updateApplicationSchema), ApplicationController.update);

/**
 * PATCH /api/v1/applications/:id/status
 * body: { status, notes? }
 */
router.patch('/:id/status', validate(updateStatusSchema), ApplicationController.updateStatus);

/**
 * POST /api/v1/applications/:id/withdraw
 */
router.post('/:id/withdraw', ApplicationController.withdraw);

/**
 * DELETE /api/v1/applications/:id  (hard delete)
 */
router.delete('/:id', ApplicationController.remove);

export default router;
