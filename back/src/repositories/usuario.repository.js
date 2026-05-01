import prisma from '../config/database.js'

const findByEmail = async (email) => {
	return await prisma.user.findUnique({
		where: {
			gmail: email
		}
	});
};

const create = async (userData) => {
	return await prisma.user.create({
		data: userData
	});
};

const findById = async (id) => {
	return await prisma.user.findUnique({
		where: {id}
	});
};

export default {
	findByEmail,
	create,
	findById
};
