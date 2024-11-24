import express, { Application, Request, Response } from 'express'
import { PrivateKey } from '@bsv/sdk'

const app: Application = express()
const port: number = 3000

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  const key = PrivateKey.fromRandom()
  res.send(key.toAddress())
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
})