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
