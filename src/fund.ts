import { Request, Response } from 'express'

export default async function (req: Request, res: Response) {
  const { number } = req.params
  res.send({ number })
}