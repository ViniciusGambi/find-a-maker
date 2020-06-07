import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('points', table=> {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('whatsapp').notNullable();
        table.string('image').notNullable();
        table.string('city').notNullable();
        table.string('uf').notNullable();
        table.decimal('latitude').notNullable();
        table.decimal('longitude', 2).notNullable();
    })
}

export async function down(knex: Knex){
    return knex.schema.dropTable('point');
}