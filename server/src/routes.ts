import express from 'express';
import knex from './database/connection'

import PointsController from './controllers/PointsController';
import ServiceController from './controllers/ServiceController';

const routes = express.Router();
const pointsController  = new PointsController();
const serviceController = new ServiceController();

routes.get('/services', serviceController.index);

routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);
routes.post('/points', pointsController.create);

export default routes;