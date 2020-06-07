import { Request, Response } from 'express';
import knex from '../database/connection';

class ServiceController {
    async index(request: Request, response: Response) {
        const services = await knex('services').select('*');
    
        const serializedServices = services.map(services => {
            return {
                id: services.id,
                title: services.title,
                image: `http://192.168.1.150:3333/uploads/${services.image}`
            }
        })
    
        return response.json(serializedServices);
    }
}

export default ServiceController;