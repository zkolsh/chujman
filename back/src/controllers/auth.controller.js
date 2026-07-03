/**
 * @fileoverview Controlador para gestionar la autenticación de usuarios
 */

import { authService } from '../services/auth.service.js';

/**
 * Controlador de autenticación
 * @namespace authController
 */

export const authController = {
	/**
	 * Inicia sesión de un usuario
	 * 
	 * @param {Object} req - Objeto de petición de Express
	 * @param {Object} req.body - Cuerpo de la petición
	 * @param {string} req.body.gmail - Correo electrónico del usuario
	 * @param {string} req.body.password - Contraseña del usuario
	 * @param {Object} res - Objeto de respuesta de Express
	 * @param {Function} next - Función para pasar el error al middleware
	 * @returns {Promise<void>} Devuelve un JSON con el token de acceso
	 */

	async login(req, res, next) {
		try {
			const { gmail, password } = req.body;
			const resultado = await authService.login(gmail, password);
			res.json({
				success: true,
				data: resultado,
				message: 'Login exitoso'
			});
		} catch (error) {
			next(error);
		}
	},

	/**
	 * Registra un nuevo usuario
	 * 
	 * @param {Object} req - Objeto de petición de Express
	 * @param {Object} req.body - Cuerpo de la petición
	 * @param {string} req.body.gmail - Correo electrónico del usuario
	 * @param {string} req.body.password - Contraseña del usuario
	 * @param {string} req.body.name - Nombre del usuario
	 * @param {Object} res - Objeto de respuesta de Express
	 * @param {Function} next - Función para pasar el error al middleware
	 * @returns {Promise<void>} Devuelve un JSON con el nuevo usuario registrado
	 */
	async register(req, res, next) {
		try {
			const { gmail, password, name } = req.body;
			const resultado = await authService.register({ gmail, password, name });
			res.status(201).json({
				success: true,
				data: resultado,
				message: 'Usuario registrado exitosamente'
			});
		} catch (error) {
			next(error);
		}
	},

	/**
	 * Valida si un token es correcto (se ejecuta tras el middleware de autenticación)
	 * 
	 * @param {Object} req - Objeto de petición de Express
	 * @param {Object} req.user - Datos del usuario inyectados por el middleware
	 * @param {Object} res - Objeto de respuesta de Express
	 * @returns {Promise<void>} Devuelve un JSON confirmando la validez del token
	 */
	async validateToken(req, res) {
		// Únicamente se llega acá si el middleware ya validó el token.
		res.json({
			success: true,
			message: 'Token válido',
			user: req.user
		})
	}
};
