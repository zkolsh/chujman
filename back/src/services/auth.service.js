import {usuarioRepository} from '../repositories/index.js';
import {comparePassword, hashPassword} from '../utils/bcrypt.js';
import {generarToken} from '../utils/jwt.js';

export const authService = {
	async login(gmail, password) {
		const usuario = await usuarioRepository.findByEmail(gmail);

		if (!usuario || !(await comparePassword(password, usuario.password))) {
			throw new Error('Credenciales incorrectas');
		}

		const token = generarToken({id: usuario.id, gmail: usuario.gmail});
		const {password: _, ...usuarioSinPassword} = usuario;

		return {token, usuario: usuarioSinPassword};
	},

	async register(data) {
		const existe = await usuarioRepository.findByEmail(data.gmail);
		if (existe) throw new Error('El email ya está registrado');

		const hashedPassword = await hashPassword(data.password);
		const usuario = await usuarioRepository.create({
			...data,
			password: hashedPassword
		});

		const token = generarToken({id: usuario.id, gmail: usuario.gmail});
		const {password: _, ...usuarioSinPassword} = usuario;

		return {token, usuario: usuarioSinPassword};
	}
};
