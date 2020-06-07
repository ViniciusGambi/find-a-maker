import Knex from 'knex';

export async function seed(knex: Knex){
    await knex('services').insert([
        { title: '3D Print', image: '3dprint.svg' },
        { title: 'CNC Cut', image: 'cnc.svg' },
    ])
}