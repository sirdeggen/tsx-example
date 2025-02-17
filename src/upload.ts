import { Request, Response } from 'express'
import { Utils, Hash, Transaction, Script } from '@bsv/sdk'

export default async function (req: Request, res: Response) {
// read body as file data
const r = new Utils.Reader()
  r.read(req.body)

  // hash file and get length in bytes
  const length = r.bin.length
  const fileHash = Utils.toHex(Hash.sha256(r.bin))

  // grab funding tokens as required (1 per kB assuming we start at 200 bytes rather than 0)
  const tokens = Math.ceil((length - 200) / 1000)
  const utxos = await Promise.all(Array(tokens).fill(0).map(async () => {
    return await db.collection('utxos').findOneAndUpdate({ fileHash: null }, { $set: { fileHash } })
  }))

  // build the data commitment transaction
  const sourceTransactions = await db.collection('txs').find({ txid: { $in: utxos.map(utxo => utxo.txid) } }).toArray()
  const tx = new Transaction()
  for (const utxo of utxos) {
    tx.addInput({
      sourceTransaction: Transaction.fromHex(sourceTransactions.find(d => d.txid === utxo.txid).rawtx),
      sourceOutputIndex: utxo.vout,
      unlockingScript: Script.fromHex(utxo.unlockingScript),
    })
  }
  tx.addOutput({
    satoshis: 0,
    lockingScript: new Data().lock(fileHash)
  })

  // tx.broadcast and get a txid
  await tx.sign()
  const initialResponse = await tx.broadcast()
  const txid = tx.id('hex')

  // store file in database
  const document = {
    txid,
    fileHash,
    beef: tx.toHexBEEF(),
    arc: [initialResponse],
  }
  await db.collection('txs').insertOne(document)

  // respond to client with confirmation

  res.send({ txid })
}