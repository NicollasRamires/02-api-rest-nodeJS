import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { knex } from "../database"
import crypto, { randomUUID } from 'node:crypto'
import { error } from "node:console"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"

export async function transactionsRoutes(app: FastifyInstance){
    /*
    add um hook (function) que executa antes das rotas globalmente no contexto de transactions    
    app.addHook('preHandler', async () => {
        console.log('')
    })
    */

    app.post('/', async (request, reply) => {

        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amount, type } = createTransactionBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if (!sessionId){
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            })
        }

        await knex('transactions').insert({
            id : crypto.randomUUID(),
            title: title,
            amount: type == 'credit' ? amount : amount  * - 1,
            session_id : sessionId
        }).returning('*')

        return reply.status(201).send()
    })

    app.get('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies 

        const transactions = await knex('transactions').where('session_id', sessionId).select()
    
        return { transactions }
    })

    app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        })
        
        const { id } = getTransactionParamsSchema.parse(request.params)

        const { sessionId } = request.cookies 

        const transactions = await knex('transactions').where({ session_id : sessionId, id }).first()
    
        return { transactions }
    })

    app.get('/summary', { preHandler: [checkSessionIdExists] }, async (request) => {
        const { sessionId } = request.cookies 

        const summary = await knex('transactions').sum('amount', { as: 'amount'}).where('session_id', sessionId).first()
        
        return { summary }
    })
}