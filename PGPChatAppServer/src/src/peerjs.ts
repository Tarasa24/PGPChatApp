import { CustomExpress } from 'peer'
import { OngoingCalls } from './models.js'
import Sequelize from 'sequelize'

export default function initPeerServer(peerServer: CustomExpress) {
  peerServer.on('connection', async (client) => {
    const clientID = client.getId()
    const callExists =
      (await OngoingCalls.count({
        where: {
          [Sequelize.Op.or]: [{ callerPeerToken: clientID }, { calleePeerToken: clientID }],
        },
      })) === 1

    if (!callExists) {
      client.getSocket()?.close()
    }
  })
}
