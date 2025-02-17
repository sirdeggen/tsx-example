import express, { Application, Request, Response } from 'express'
import { PrivateKey } from '@bsv/sdk'
import db from './db'
import html from './frontend'
import dotenv from 'dotenv'
dotenv.config()

const { FUNDING_WIF, PORT } = process.env

const app: Application = express()
const port: number = 3000

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
  res.send({ accepted: 'true' })
})

app.post('/download', async (req: Request, res: Response) => {
  res.send({ file: '' })
})


app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
})