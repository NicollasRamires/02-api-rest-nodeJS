import { expect, test, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { title } from 'process'

beforeAll(async () => {
    await app.ready()
})

afterAll(async () => {
    await app.close()
})

test('user can create a new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
        title : 'new transaction',
        amount : 500,
        type : 'credit'
    })
    .expect(201)
})