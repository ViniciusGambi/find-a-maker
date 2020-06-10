import express from 'express';
import { celebrate, Joi } from 'celebrate';

import knex from './database/connection'
import multer from 'multer';
import multerConfig from './config/multer';

import PointsController from './controllers/PointsController';
import ServiceController from './controllers/ServiceController';

const routes = express.Router();
const upload = multer(multerConfig);

const pointsController = new PointsController();
const serviceController = new ServiceController();

routes.get('/services', serviceController.index);

routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);
routes.post(
    '/points',
    upload.single('image'),
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required().max(2),
            services: Joi.string().required()
        })
    }, {
        abortEarly: false
    }),
    pointsController.create
);

export default routes;