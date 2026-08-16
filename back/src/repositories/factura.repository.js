import prisma from '../config/database.js'

const create = async (facturaData) => {
	return await prisma.factura.create({
		data: facturaData
	});
};

const findByUserId = async (userId) => {
	return await prisma.factura.findMany({
		where: { userId },
		orderBy: { createdAt: 'desc' }
	});
};

const findById = async (id) => {
	return await prisma.factura.findUnique({
		where: { id },
        include: { user: true }
	});
};

export default {
	create,
	findByUserId,
    findById
};
