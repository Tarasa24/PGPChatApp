import express from 'express'
import CryptoJS from 'crypto-js'
import bs58 from 'bs58'
import crypto from 'crypto'
import { KeyServerEntry, KeyServerEntryType } from '../models.js'

const router = express.Router()

/**
 * @swagger
 * /keyserver/check/{id}:
 *   get:
 *     tags:
 *       - keyserver
 *     description: Checks if provided **ChatApp ID** is in use
 *     parameters:
 *       - name: id
 *         description: ChatApp ID
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Chatapp ID is availible (doesn't exist)
 *       400:
 *         description: Invalid syntax
 *       409:
 *         description: Chatapp ID isn't availible (exists)
 *       500:
 *         description: Returns json describing the error
 */
router.get('/check/:id', async (req, res) => {
  // Syntax check
  if (!req.params.id) {
    res.sendStatus(400)
    return
  }

  try {
    const { count } = await KeyServerEntry.findAndCountAll({
      where: { id: req.params.id },
    })
    if (count === 0) res.sendStatus(200)
    else res.sendStatus(409)
  } catch (error) {
    res.status(500).json(error)
  }
})

/**
 * @swagger
 * /keyserver/create:
 *   post:
 *     tags:
 *       - keyserver
 *     description: Checks ChatApp ID derivation and creates entry in DB for provided **ChatApp ID** and **Public Key**
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: json
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: ChatApp ID
 *             publicKey:
 *               type: string
 *               description: PGP Public Key
 *     responses:
 *       201:
 *         description: Keyserver entry has been created
 *       400:
 *         description: Invalid syntax
 *       403:
 *         description: Entry already exists
 *       409:
 *         description: Provided ChatApp ID doesn't match server-side derived ChatApp ID
 *       500:
 *         description: Returns json describing the error
 */
router.post('/create', async (req, res) => {
  // Syntax check
  if (!req.body.id || !req.body.publicKey) {
    res.sendStatus(400)
    return
  }

  // Validate derived ID
  function generateDerivedAdress(publicKey: string) {
    const firstHash = CryptoJS.SHA256(publicKey)
    const secondHash = CryptoJS.RIPEMD160(firstHash).toString()

    return bs58.encode(Buffer.from(secondHash, 'hex'))
  }
  if (generateDerivedAdress(req.body.publicKey) !== req.body.id) {
    res.sendStatus(409)
    return
  }

  try {
    // Check ID uniqueness without throwing an error on INSERT querry
    const { count } = await KeyServerEntry.findAndCountAll({
      where: { id: req.body.id },
    })
    if (count !== 0) res.sendStatus(403)
    else {
      // Create entry
      await KeyServerEntry.create({
        id: req.body.id,
        publicKey: req.body.publicKey,
        nonce: crypto.randomBytes(4).readUInt32BE(0),
      } as KeyServerEntryType)
      res.sendStatus(201)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

/**
 * @swagger
 * /keyserver/lookup/{id}:
 *   get:
 *     tags:
 *       - keyserver
 *     description: Returns ChatApp user information (if found)
 *     parameters:
 *       - name: id
 *         description: ChatApp ID
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User found
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: ChatApp ID
 *             publicKey:
 *               type: string
 *               description: PGP Public Key
 *             createdAt:
 *               type: number
 *               description: Unix timestamp
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid syntax
 *       500:
 *         description: Returns json describing the error
 */
router.get('/lookup/:id', async (req, res) => {
  // Syntax check
  if (!req.params.id) {
    res.sendStatus(400)
    return
  }

  try {
    const userModel = await KeyServerEntry.findOne({
      where: { id: req.params.id },
    })
    if (userModel === null) res.sendStatus(404)
    else {
      const user = userModel.toJSON() as {
        id: string
        publicKey: string
        createdAt: Date
      }
      res.status(200).json({
        id: user.id,
        publicKey: user.publicKey,
        createdAt: Math.round(user.createdAt.getTime() / 1000),
      })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

/**
 * @swagger
 * /keyserver/getNonce/{id}:
 *   get:
 *     tags:
 *       - keyserver
 *     description: Returns ChatApp user's nonce (if found) used for socket loggin
 *     parameters:
 *       - name: id
 *         description: ChatApp ID
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User found
 *         schema:
 *           type: number
 *           description: Random 32-bit nonce
 *           example: 3376831505
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid syntax
 *       500:
 *         description: Returns json describing the error
 */
router.get('/getNonce/:id', async (req, res) => {
  // Syntax check
  if (!req.params.id) {
    res.sendStatus(400)
    return
  }

  try {
    const userModel = await KeyServerEntry.findOne({
      where: { id: req.params.id },
    })
    if (userModel === null) res.sendStatus(404)
    else {
      const { nonce } = userModel.toJSON() as KeyServerEntryType
      res.status(200).send(nonce.toString())
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

export default router
