import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('transactions', (table) => {
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable().alter();
    })
}


export async function down(knex: Knex): Promise<void> {
}

