import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {

    async index(request: Request, response: Response) {
        const { city, uf, services } = request.query;

        const parsedServices = String(services)
            .split(',')
            .map(service => Number(service.trim()));

        const points = await knex('points')
            .join('point_service', 'points.id', '=', 'point_service.point_id')
            .whereIn('point_service.service_id', parsedServices)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        return response.json(points);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await knex('points').where('id', id).first();

        if (!point) {
            return response.status(400).json({ message: 'Point not found' });
        }

        const services = await knex('services')
            .join('point_service', 'services.id', '=', 'point_service.service_id')
            .where('point_service.point_id', id)
            .select('services.title');

        return response.json({ point, services });
    }

    async create(request: Request, response: Response) {
        const {
            name,
            whatsapp,
            image,
            city,
            uf,
            latitude,
            longitude,
            services
        } = request.body;

        const point = {
            name,
            whatsapp,
            image: 'https://images.unsplash.com/photo-1563520240533-66480a3916fe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=80',
            city,
            uf,
            latitude,
            longitude
        };

        const trx = await knex.transaction();

        const insertedIds = await trx('points').insert(point);
        const point_id = insertedIds[0];
        const pointService = services.map((service_id: number) => {
            return {
                service_id,
                point_id
            }
        });

        await trx('point_service').insert(pointService);
        trx.commit();
        return response.json({
            id: point_id,
            ...point
        });
    }
}

export default PointsController;