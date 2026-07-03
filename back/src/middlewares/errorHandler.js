/**
 * @fileoverview Middleware centralizado para el manejo de errores
 */

/**
 * Intercepta los errores lanzados por los controladores o servicios y los mapea a códigos HTTP y mensajes seguros
 * 
 * @param {Error} err - Objeto de error capturado
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Siguiente middleware (necesario por la firma de Express)
 * @returns {void} Envía una respuesta JSON con el error mapeado
 */

export const errorHandler = (err, req, res, next) => {
	console.error('[Server Error]:', err.message);

	const errorMap = {
		'Credenciales incorrectas': 401,
		'El email ya está registrado': 409,
		'No autorizado': 401
	};

	const status = errorMap[err.message] || 500;
	const message = status === 500 ? 'Error interno del servidor' : err.message;

	res.status(status).json({
		success: false,
		message
	});
};
