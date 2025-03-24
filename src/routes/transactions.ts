import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { knex } from "../database"
import crypto from 'node:crypto'

export async function transactionsRoutes(app: FastifyInstance){
    app.get('/', async () => {
        const transactions = await knex('transactions').select()
    
        return { transactions }
    })

    app.get('/:id', async (request) => {
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        })
        
        const { id } = getTransactionParamsSchema.parse(request.params)

        const transactions = await knex('transactions').where('id', id).first()
    
        return { transactions }
    })

    app.post('/', async (request, reply) => {

        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amount, type } = createTransactionBodySchema.parse(request.body)

        await knex('transactions').insert({
            id : crypto.randomUUID(),
            title: title,
            amount: type == 'credit' ? amount : amount  * - 1,
        }).returning('*')

        return reply.status(201).send()
    })

    app.get('/summary', async () => {
        const summary = await knex('transactions').sum('amount', { as: 'amount'}).first()
        
        return { summary }
    })
}