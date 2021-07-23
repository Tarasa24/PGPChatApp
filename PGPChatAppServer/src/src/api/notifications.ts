import express, { Request } from 'express'
import { verifyNonceSignature } from '../helperFunctions.js'
import { KeyServerEntry } from '../models.js'

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
router.put(
  '/registerToken',
  async (req: Request<{}, {}, registerTokenBody>, res) => {
    try {
      console.log(req.body.token)
      // Syntax check
      if (!req.body.id || !req.body.signature || !req.body.signature) {
        res.sendStatus(400)
        return
      }

      //Validate signature
      if (!await verifyNonceSignature(req.body.id, req.body.signature)) {
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
  }
)

export default router
