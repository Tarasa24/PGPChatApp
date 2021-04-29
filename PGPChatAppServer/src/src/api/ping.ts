import express from 'express'

const router = express.Router()

/**
 * @swagger
 * /ping:
 *   get:
 *     tags:
 *       - misc
 *     description: Api ping route
 *     responses:
 *       204:
 *         description: Empty response
 */
router.get('/', (req, res) => {
  res.sendStatus(204)
})

export default router
