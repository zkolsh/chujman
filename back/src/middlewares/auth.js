import {verifyToken} from '../utils/jwt.js';

export const authMiddleware = {
	verifyToken(req, res, next) {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith('Bearer ')) {
			return res.status(401).json({success: false, message: 'Token no proporcionado'});
		}

		const token = authHeader.split(' ')[1];
		try {
			const decoded = verifyToken(token);
			req.user = decoded;
			next();
		} catch (error) {
			return res.status(401).json({success: false, message: 'Token inválido o expirado'});
		}
	},

	authorize(...roles) {
		return (req, res, next) => {
			if (!roles.includes(req.user.rol)) {
				return res.status(403).json({success: false, message: 'Permisos insuficientes'});
			}
			next();
		};
	}
};
