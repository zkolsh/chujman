import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import helmet from 'helmet';
import morgan from 'morgan';
import {errorHandler} from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
	origin: process.env.FRONTEND_URL || '*',
	credentials: true
}));
app.use(express.json());
app.use(morgan('dev'))

app.use('/api', routes);
app.use(errorHandler);

export default app;
