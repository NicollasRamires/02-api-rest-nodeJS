"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.alterTable('transactions', (table) => {
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable().alter();
    });
}
async function down(knex) {
}
