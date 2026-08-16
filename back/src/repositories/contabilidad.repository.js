import prisma from '../config/database.js'

const create = async (asientoData) => {
	return await prisma.asientoContable.create({
		data: asientoData
	});
};

const findAll = async () => {
	return await prisma.asientoContable.findMany({
		orderBy: { createdAt: 'desc' }
	});
};

export default {
	create,
	findAll
};
