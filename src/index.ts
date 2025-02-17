import express, { Application, Request, Response } from 'express'
import { PrivateKey } from '@bsv/sdk'
import db from './db'
import html from './frontend'
import dotenv from 'dotenv'
import { error } from 'console'
dotenv.config()

const { FUNDING_WIF, PORT } = process.env

const app: Application = express()

app.use(express.json())

app.get('/', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html')
  const remainingFundingTokens = await db.collection('funding').countDocuments({ spendTxid: null })
  const address = PrivateKey.fromWif(FUNDING_WIF).toAddress().toString()
  res.send(html(address, remainingFundingTokens))
})

app.get('/fund/:number', async (req: Request, res: Response) => {
  const { number } = req.params
  res.send({ number })
})

app.post('/upload', async (req: Request, res: Response) => {

  // hash file and get length in bytes

  // grab funding tokens as required (1 per kB assuming we start at 200 bytes rather than 0)
  
  // tx.broadcast and get a txid
  
  // store file in database

  // respond to client with confirmation

  res.send({ accepted: 'true' })
})

app.get('/download/:id', async (req: Request, res: Response) => {
  // get the data by its txid or hash

  
  // return the file data only
  res.send({ file: '' })
})

app.get('/integrity/:id', async (req: Request, res: Response) => {
  // get the transaction and merkle path

  // return that for validation client side.
  res.send({beef: 'dead'})
})

app.post('/callback', async (req: Request, res: Response) => {
  // make sure this is ARC calling us
  if (req?.headers?.authorization !== process.env.CALLBACK_TOKEN) {
    res.status(401).send({ error: 'Unauthorized' })
    return
  }
  const { txid } = req.body
  await db.collection('txs').updateOne({ txid }, { $addToSet: { arc: req.body, time: Date.now() } })
  res.send({ accepted: 'true' })
})

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
})