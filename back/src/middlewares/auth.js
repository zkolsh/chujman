/**
 * @fileoverview Middlewares para verificar la autenticación y autorización
 */

import { verifyToken } from '../utils/jwt.js';

/**
 * Colección de middlewares de autenticación
 * @namespace authMiddleware
 */

export const authMiddleware = {

	/**
	 * Verifica que el token JWT sea válido e inyecta los datos del usuario en la petición (req.user)
	 * 
	 * @param {Object} req - Objeto de petición de Express
	 * @param {Object} res - Objeto de respuesta de Express
	 * @param {Function} next - Función para pasar el control al siguiente middleware
	 * @returns {Object|void} Retorna un error 401 si falla, o llama a next() si tiene éxito
	 */

	verifyToken(req, res, next) {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith('Bearer ')) {
			return res.status(401).json({ success: false, message: 'Token no proporcionado' });
		}

		const token = authHeader.split(' ')[1];
		try {
			const decoded = verifyToken(token);
			req.user = decoded;
			next();
		} catch (error) {
			return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
		}
	},

	/**
	 * Crea un middleware que restringe el acceso según los roles del usuario
	 * 
	 * @param {...string} roles - Lista de roles permitidos para la ruta
	 * @returns {Function} Middleware de autorización
	 */

	authorize(...roles) {
		return (req, res, next) => {
			if (!roles.includes(req.user.rol)) {
				return res.status(403).json({ success: false, message: 'Permisos insuficientes' });
			}
			next();
		};
	}
};
