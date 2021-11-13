import express, { Request } from 'express'
import Sequelize from 'sequelize'
import { verifyNonceSignature } from '../helperFunctions.js'
import { io } from '../index.js'
import { OngoingCalls, OngoingCallsType } from '../models.js'
import { userSocketMap } from '../socketIO.js'
import { CallPayload, UserID } from '../types.js'

const router = express.Router()

interface WebRTCReqBody {
  id: UserID
  signature: string
}

/**
 * @swagger
 * /call/end:
 *   post:
 *     tags:
 *       - call
 *     description: Ends ongoing call for callee with given **id**. Request is authenticated by supplied signature.
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
 *     responses:
 *       200:
 *         description: Call session has been ended
 *       400:
 *         description: Invalid syntax
 *       401:
 *         description: Invalid signature
 *       410:
 *         description: Call session doesn't exists
 *       500:
 *         description: Returns json describing the error
 */
router.post('/end', async (req: Request<{}, {}, WebRTCReqBody>, res) => {
  try {
    // Syntax check
    console.log(req.body)

    if (!req.body.id || !req.body.signature) {
      res.sendStatus(400)
      return
    }

    // Signature check
    const valid = await verifyNonceSignature(req.body.id, req.body.signature)
    if (!valid) {
      res.sendStatus(401)
      return
    }

    const call = (await OngoingCalls.findOne({
      where: { callee: req.body.id },
    })) as OngoingCallsType | null

    if (call !== null) {
      io.to(userSocketMap[call.caller]).emit('endCall', {
        caller: call.caller,
        callee: call.callee,
        reason: 'REJECTED',
      } as CallPayload & { reason: string })
      await OngoingCalls.destroy({ where: { id: call.id } })
      res.sendStatus(200)
    } else res.sendStatus(410)
  } catch (error) {
    res.status(500).json(error)
  }
})

/**
 * @swagger
 * /call/accept:
 *   post:
 *     tags:
 *       - call
 *     description: Requests server's socket to emit *call event* to **id**'s socket. Request is authenticated by supplied signature.
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
 *     responses:
 *       200:
 *         description: Event fired
 *       202:
 *         description: Success but id's socket hasn't yet connected
 *       400:
 *         description: Invalid syntax
 *       401:
 *         description: Invalid signature
 *       410:
 *         description: Call session doesn't exists
 *       500:
 *         description: Returns json describing the error
 */
router.post('/accept', async (req: Request<{}, {}, WebRTCReqBody>, res) => {
  try {
    // Syntax check
    if (!req.body.id || !req.body.signature) {
      res.sendStatus(400)
      return
    }

    // Signature check
    const valid = await verifyNonceSignature(req.body.id, req.body.signature)
    if (!valid) {
      res.sendStatus(401)
      return
    }

    const call = (await OngoingCalls.findOne({
      where: { callee: req.body.id },
    })) as OngoingCallsType | null

    if (call !== null) {
      if (userSocketMap[call.callee]) {
        io.to(userSocketMap[call.callee]).emit('call', {
          caller: call.caller,
          callerPeerToken: call.callerPeerToken,
          callee: call.callee,
          calleePeerToken: call.calleePeerToken,
        } as CallPayload)
        res.sendStatus(200)
      } else res.sendStatus(202)
    } else res.sendStatus(410)
  } catch (error) {
    res.status(500).json(error)
  }
})

/**
 * @swagger
 * /call/{id}:
 *   get:
 *     tags:
 *       - call
 *     description: Asks server if call session to **id** is still active. Used for verification that the call notification should be shown.
 *     parameters:
 *       - name: id
 *         description: ChatApp ID
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Call session exists - Notification should still be shown
 *       400:
 *         description: Invalid syntax
 *       410:
 *         description: Call session doesn't exists - Discard notification
 *       500:
 *         description: Returns json describing the error
 */

router.get('/:id', async (req: Request<{ id: string }, {}, {}>, res) => {
  try {
    // Syntax check
    if (!req.params.id) {
      res.sendStatus(400)
      return
    }

    const count = await OngoingCalls.count({
      where: {
        [Sequelize.Op.or]: [{ caller: req.params.id }, { callee: req.params.id }],
      },
    })

    if (count >= 1) res.sendStatus(200)
    else res.sendStatus(410)
  } catch (error) {
    res.status(500).json(error)
  }
})

export default router
