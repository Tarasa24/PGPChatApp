import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import fs from 'fs/promises'
import path from 'path'

import keyserver from './api/keyserver.js'
import notifications from './api/notifications.js'
import ping from './api/ping.js'

const router = express.Router()

async function getAllApis() {
  try {
    const absPath = path.join(process.cwd(), 'build/api/')
    const dirContent = await fs.readdir(absPath)
    const re = new RegExp(/.*\.js$/)

    return dirContent
      .filter((file) => re.test(file))
      .map((file) => path.join(absPath, file))
  } catch (error) {
    throw error
  }
}

const swaggerSpec = await swaggerJSDoc({
  definition: {
    info: {
      title: 'ChatApp API',
      version: '1.0',
    },
    basePath: process.env.NODE_ENV === 'production' ? '/app-api' : '',
  },
  apis: await getAllApis(),
})

router.use('/docs/', swaggerUi.serve)
router.get('/docs/', swaggerUi.setup(swaggerSpec))

router.use('/keyserver/', keyserver)
router.use('/notifications/', notifications)
router.use('/ping', ping)

export default router
