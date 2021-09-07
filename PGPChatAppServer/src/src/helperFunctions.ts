import { KeyServerEntry, KeyServerEntryType } from './models.js'
import openpgp from 'openpgp'
import crypto from 'crypto'

export async function verifyNonceSignature(userID: string, signature: string) {
  try {
    const userModel = await KeyServerEntry.findOne({
      where: { id: userID },
    })
    if (userModel === null) throw "UserID dosen't exist"
    const { nonce, publicKey } = userModel.toJSON() as KeyServerEntryType

    const verifyResult = await openpgp.verify({
      message: await openpgp.Message.fromText(nonce.toString()),
      signature: await openpgp.readSignature({
        armoredSignature: signature,
      }),
      publicKeys: await openpgp.readKey({ armoredKey: publicKey }),
    })
    if (!verifyResult.signatures[0].verified) throw 'Invalid signature'

    // Generate new nonce
    await KeyServerEntry.update(
      { nonce: crypto.randomBytes(4).readUInt32BE(0) },
      { where: { id: userID } }
    )

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
