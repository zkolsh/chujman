import express from 'express';
import { getProjects, createProject } from '../../controllers/project.controller.js';
import {authMiddleware} from '../../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.route('/')
  .get(getProjects)
  .post(createProject);

export default router;