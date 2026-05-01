import {authService} from '../services/auth.service.js';

export const authController = {
	async login(req, res, next) {
		try {
			const {gmail, password} = req.body;
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

	async register(req, res, next) {
		try {
			const {gmail, password, name} = req.body;
			const resultado = await authService.register({gmail, password, name});
			res.status(201).json({
				success: true,
				data: resultado,
				message: 'Usuario registrado exitosamente'
			});
		} catch (error) {
			next(error);
		}
	},

	async validateToken(req, res) {
		// Únicamente se llega acá si el middleware ya validó el token.
		res.json({
			success: true,
			message: 'Token válido',
			user: req.user
		})
	}
};
