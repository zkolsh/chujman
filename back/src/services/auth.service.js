/**
 * @fileoverview Lógica de negocio para la autenticación de usuarios
 */

import { usuarioRepository } from '../repositories/index.js';
import { comparePassword, hashPassword } from '../utils/bcrypt.js';
import { generarToken } from '../utils/jwt.js';

/**
 * Servicio de autenticación
 * @namespace authService
 */

export const authService = {

	/**
	 * Valida las credenciales y genera un token de acceso
	 * 
	 * @param {string} gmail - Correo electrónico del usuario
	 * @param {string} password - Contraseña en texto plano
	 * @returns {Promise<Object>} Devuelve un objeto con el `token` y los datos del `usuario`
	 * @throws {Error} Si las credenciales son incorrectas
	 */

	async login(gmail, password) {
		const usuario = await usuarioRepository.findByEmail(gmail);

		if (!usuario || !(await comparePassword(password, usuario.password))) {
			throw new Error('Credenciales incorrectas');
		}

		const token = generarToken({ id: usuario.id, gmail: usuario.gmail, name: usuario.name });
		const { password: _, ...usuarioSinPassword } = usuario;

		return { token, usuario: usuarioSinPassword };
	},

	/**
	 * Crea un nuevo usuario, guarda la contraseña hasheada y genera un token
	 * 
	 * @param {Object} data - Datos del nuevo usuario
	 * @param {string} data.gmail - Correo electrónico
	 * @param {string} data.password - Contraseña en texto plano
	 * @param {string} data.name - Nombre del usuario
	 * @returns {Promise<Object>} Devuelve un objeto con el `token` y los datos del `usuario`
	 * @throws {Error} Si el formato del correo electrónico es inválido
	 * @throws {Error} Si el email ya está registrado
	 */

	async register(data) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(data.gmail)) {
			throw new Error('Formato de correo electrónico inválido');
		}

		const existe = await usuarioRepository.findByEmail(data.gmail);
		if (existe) throw new Error('El email ya está registrado');

		const hashedPassword = await hashPassword(data.password);
		const usuario = await usuarioRepository.create({
			...data,
			password: hashedPassword
		});

		const token = generarToken({ id: usuario.id, gmail: usuario.gmail, name: usuario.name });
		const { password: _, ...usuarioSinPassword } = usuario;

		return { token, usuario: usuarioSinPassword };
	}
};
