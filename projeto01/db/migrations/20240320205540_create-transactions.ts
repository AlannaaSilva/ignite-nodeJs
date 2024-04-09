import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table)=>{
    //criando coluna na tabela
    table.uuid('id').primary()//universal unique id
    table.text('title').notNullable()
    table.decimal('amount',10,2).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('transactions')
}
