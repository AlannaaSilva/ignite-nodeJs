import { it, beforeAll, afterAll, describe, expect, beforeEach} from 'vitest';
import { execSync } from 'child_process';
import request from 'supertest';
import { app } from '../app';

describe ('Transactions Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })
  
  afterAll (async() =>{
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all') // zera todo o banco de dados
    execSync('npm run knex migrate:latest') //criar novas tabelas
  })

//usando a função test
  it('should be able to create a new transaction', async() => {
    await request(app.server)
      .post('/transactions')
      .send({
        title:'New transaction',
        amount: 5000,
        type:'credit',
     })
  .expect(201)
  })

it ('should be able to list all transactions', async() => {
  const createTransactionResponse = await request(app.server)
   .post('/transactions')
   .send({
     title:'New transaction',
     amount: 5000,
     type:'credit',
    })

  // Assume que cookies pode ser string[] | undefined
  const cookies = createTransactionResponse.get('Set-Cookie');

  // Se cookies não for undefined, junte todos os cookies em uma string; caso contrário, use uma string vazia
  const cookieString = cookies ? cookies.join('; ') : '';

  // Agora, cookieString é uma string (que pode ser vazia se não houver cookies), então pode ser usada com .set()
  const listTransactionResponse = await request(app.server)
    .get('/transactions')
    .set('Cookie', cookieString) // Usando cookieString aqui
    .expect(200);

    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title:'New transaction',
        amount: 5000,
      })
    ])
  })


  it ('should be able to get a specific transaction', async() => {
    const createTransactionResponse = await request(app.server)
     .post('/transactions')
     .send({
       title:'New transaction',
       amount: 5000,
       type:'credit',
      })
  
    // Assume que cookies pode ser string[] | undefined
    const cookies = createTransactionResponse.get('Set-Cookie');
    
    // Se cookies não for undefined, junte todos os cookies em uma string; caso contrário, use uma string vazia
    const cookieString = cookies ? cookies.join('; ') : '';
  
    // Agora, cookieString é uma string (que pode ser vazia se não houver cookies), então pode ser usada com .set()
    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookieString) // Usando cookieString aqui
      .expect(200);
    
    const transactionId = listTransactionResponse.body.transactions[0].id


    const getTransactionresponse = await request(app.server)
    .get(`/transactions/${transactionId}`)
    .set('Cookie', cookieString) // Usando cookieString aqui
    .expect(200);

      expect(getTransactionresponse.body.transaction).toEqual(
        expect.objectContaining({
          title:'New transaction',
          amount: 5000,
        })
      )
    })


  it ('should be able to get the summary', async() => {
      const createTransactionResponse = await request(app.server)
       .post('/transactions')
       .send({
         title:'Credit transaction',
         amount: 5000,
         type:'credit',
        })
    
      // Assume que cookies pode ser string[] | undefined
      const cookies = createTransactionResponse.get('Set-Cookie');
    
      // Se cookies não for undefined, junte todos os cookies em uma string; caso contrário, use uma string vazia
      const cookieString = cookies ? cookies.join('; ') : '';
        
      // Agora, cookieString é uma string (que pode ser vazia se não houver cookies), então pode ser usada com .set()
      await request(app.server)
        .post('/transactions')
        .set('Cookie', cookieString) // Usando cookieString aqui
        .send({
          title:'Debit Transaction',
          amount: 2000,
          type:'debit',
        })

      const summaryResponse = await request(app.server)
        .get('/transactions/summary')
        .set('Cookie', cookieString) // Usando cookieString aqui
        .expect(200);
    
        expect(summaryResponse.body.summary).toEqual({
          amount:3000,
        })
      })  
})
