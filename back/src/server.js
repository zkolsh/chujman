import app from './app.js';
import prisma from './config/database.js';
const PORT = process.env.SERVER_PORT || 3000;

async function main() {
	try {
		await prisma.$connect();
		console.log('Base de datos conectada');

		app.listen(PORT, () => {
			console.log(`Servidor listo en http://localhost:${PORT}`);
			console.log(`Endpoints en http://localhost:${PORT}/api/v1`);
		});
	} catch (error) {
		console.error('FATAL:', error);
		process.exit(1);
	}
}

main();
