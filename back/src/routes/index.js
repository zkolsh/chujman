/**
 * @fileoverview Enrutador principal que agrupa todas las rutas de la API
 */

import { Router } from 'express';
import v1Routes from './v1/index.js';

const router = Router();

router.use('/v1', v1Routes);

router.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date() })
})

export default router;
