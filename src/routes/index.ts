import { Router } from 'express';
import jobRoutes from './job.routes';
import applicationRoutes from './application.routes';

const router = Router();

router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);

export default router;
