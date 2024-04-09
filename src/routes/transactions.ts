import { FastifyInstance } from "fastify"
import { z } from  'zod'
import { knex } from "../database"
import crypto, { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"

export async function transactionsRoutes(app: FastifyInstance){

  app.get('/', {preHandler:[checkSessionIdExists]}, async( request, reply) => {

    const { sessionId } = request.cookies


    const transactions = await knex('transactions').where('session_id', sessionId).select()

    return {
      transactions, 
    }
  })
  
app.get('/:id', {preHandler:[checkSessionIdExists]}, async (request) => {

  
  const getTransactionParamsSchema = z.object({
    id: z.string().uuid(),
  });
  
  const { id } = getTransactionParamsSchema.parse(request.params);
  
  const { sessionId } = request.cookies
  
  const transaction = await knex('transactions').where({
    session_id: sessionId,
    id:id
  }).first();

  return {
    transaction,
  }
})

app.get('/summary',{preHandler:[checkSessionIdExists]}, async(request) => {
  const { sessionId } = request.cookies

  const summary = await knex('transactions').where('session_id', sessionId).sum('amount', { as:'amount'}).first()//.sum soma os valores da coluna nesse caso a coluna amount, as '' nome que quer dar para a coluna
  return {
    summary,
  }
})

  app.post('/',  async(request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type}= createTransactionBodySchema.parse(request.body)
   
    let sessionId = request.cookies.sessionId

    if(!sessionId){
      sessionId= randomUUID()
      reply.cookie('sessionId', sessionId, {
        path:'/', //quais rotas pode acessar esse cookie 
        maxAge: 60 * 60 * 24 * 7, // 7 dias para o cookie expirar
      })//reply para salvar no cookie o novo id

    }
  await knex ('transactions')
    .insert({
      id: crypto.randomUUID(),
      title,
      session_id: sessionId,
      amount: type ==='credit' ? amount : amount * -1,
    })
    return reply.status(201).send
  })

}

