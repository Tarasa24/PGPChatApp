import express, { Request } from 'express'
import { verifyNonceSignature } from '../helperFunctions.js'
import { KeyServerEntry, MessagesQueue } from '../models.js'
import { io } from '../index.js'
import { MessagesQueueType, MessageUpdateQueue } from '../models.js'
import { MessageUpdatePayload } from '../types.js'
import { userSocketMap } from '../socketIO.js'

const router = express.Router()

interface registerTokenBody {
  id: string
  signature: string
  token: string
}
/**
 * @swagger
 * /notifications/registerToken:
 *   put:
 *     tags:
 *       - notifications
 *     description: Saves provided notification token to the database. Request has to be verified by providing signature of the nonce
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
 *             signature:
 *               type: string
 *               description: PGP Signature of nonce for validation that the request origin is the holder of ID's private key
 *             token:
 *               type: string
 *               deycription: Obtained Firebase token
 *     responses:
 *       201:
 *         description: Token succesfully written
 *       400:
 *         description: Invalid syntax
 *       401:
 *         description: Invalid signature
 *       500:
 *         description: Returns json describing the error
 */
router.put('/registerToken', async (req: Request<{}, {}, registerTokenBody>, res) => {
  try {
    // Syntax check
    if (!req.body.id || !req.body.signature || !req.body.token) {
      res.sendStatus(400)
      return
    }

    //Validate signature
    if (!(await verifyNonceSignature(req.body.id, req.body.signature))) {
      res.sendStatus(401)
      return
    }

    await KeyServerEntry.update(
      { notificationToken: req.body.token },
      { where: { id: req.body.id } }
    )

    res.sendStatus(201)
  } catch (error) {
    console.error(error)

    res.status(500).json(error)
  }
})

interface AckBody {
  id: string
  signature: string
  messageID: string
  notificationTo: string
}

/**
 * @swagger
 * /notifications/ack:
 *   post:
 *     tags:
 *       - notifications
 *     description: Notifies server that notification has been delivered. Request has to be verified by providing signature of the nonce
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
 *             signature:
 *               type: string
 *               description: PGP Signature of nonce for validation that the request origin is the holder of ID's private key
 *             messageID:
 *               type: string
 *               description: ID of the message in question
 *             notificationTo:
 *               type: string
 *               description: Who should be the "delivered" status update sent to
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid syntax
 *       401:
 *         description: Invalid signature
 *       500:
 *         description: Returns json describing the error
 */
router.post('/ack', async (req: Request<{}, {}, AckBody>, res) => {
  try {
    console.log(req.body.id)

    // Syntax check
    if (
      !req.body.id ||
      !req.body.signature ||
      !req.body.messageID ||
      !req.body.notificationTo
    ) {
      res.sendStatus(400)
      return
    }

    //Validate signature
    if (!(await verifyNonceSignature(req.body.id, req.body.signature))) {
      res.sendStatus(401)
      return
    }

    const now = Date.now()
    if (userSocketMap[req.body.notificationTo])
      io.to(userSocketMap[req.body.notificationTo]).emit('messageUpdate', {
        action: 'SET_STATUS_RECIEVED',
        messageId: req.body.messageID,
        to: req.body.notificationTo,
        timestamp: now,
      } as MessageUpdatePayload)

    // Add to queue in case status wasn't recieved
    await MessageUpdateQueue.create({
      action: 'SET_STATUS_RECIEVED',
      messageId: req.body.messageID,
      to: req.body.notificationTo,
      timestamp: now,
    } as MessageUpdatePayload)

    res.sendStatus(200)
  } catch (error) {
    res.status(500).json(error)
  }
})

export default router
