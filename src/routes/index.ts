import { Router } from 'express';
import jobRoutes from './job.routes';
import applicationRoutes from './application.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/users', userRoutes );

export default router;
