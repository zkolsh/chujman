/**
 * @fileoverview Interacción con la base de datos (Prisma) para los usuarios
 */

import prisma from '../config/database.js'

/**
 * Busca un usuario por su correo electrónico
 * @param {string} email - Correo del usuario
 * @returns {Promise<Object|null>} Usuario encontrado o null
 */

const findByEmail = async (email) => {
	return await prisma.user.findUnique({
		where: {
			gmail: email
		}
	});
};

/**
 * Crea un usuario en la base de datos
 * @param {Object} userData - Datos del usuario a crear
 * @returns {Promise<Object>} Usuario creado
 */

const create = async (userData) => {
	return await prisma.user.create({
		data: userData
	});
};

/**
 * Busca un usuario por su ID
 * @param {number} id - ID del usuario
 * @returns {Promise<Object|null>} Usuario encontrado o null
 */

const findById = async (id) => {
	return await prisma.user.findUnique({
		where: { id }
	});
};

const update = async (id, data) => {
    return await prisma.user.update({
        where: { id },
        data
    });
};

export default {
	findByEmail,
	create,
	findById,
    update
};
