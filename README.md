<center>
<img align="left" src="https://i.imgur.com/VbR6a5i.png">
<h1>PGP ChatApp</h1>
Chat Securely Through The Power Of PGP Encryption
</center>
</br>

---

## General info

[React-Native](https://reactnative.dev/) app for Android (with some configuration cross-platform also possible), combining privacy of [PGP encryption standard](https://www.openpgp.org/) with all the fundemental features of an chatapp. Supports texting, sending media, notifications and even [WebRTC](https://webrtc.org/) calling, all encrypted and signed with your own keypair, contents of your messages including files are therefore by design completely obscure to the relaying server. It even has dark mode!

## Setup

Download and install [latest release](https://github.com/Tarasa24/PGPChatApp/releases/tag/1.1.0). Inside the app then either generate new keypair or use existing private key that has been previously exported.

| ![Installation 1](https://i.imgur.com/FBC9rnK.png) | ![Installation 2](https://i.imgur.com/YvksOUE.png) |
| -------------------------------------------------- | -------------------------------------------------- |

## Features

| ![Features 1](https://i.imgur.com/3i5ayZi.png) | ![Features 2](https://i.imgur.com/pyzHGhq.png) | ![Features 3](https://i.imgur.com/SIOZ7eZ.png) |
| ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |

## Contact

> FLXgmHXfagBGzbA81reT6zKKHNJ

![QR code](https://i.imgur.com/63f7rNy.png)

## Technologies

- **ChatApp**

  - [React-Native](https://reactnative.dev/)
  - [react-native-fast-openpgp](https://www.npmjs.com/package/react-native-fast-openpgp)
  - [crypto.js](https://www.npmjs.com/package/crypto-js)
  - [socket.io-client](https://socket.io/)
  - [react-native-webrtc](https://www.npmjs.com/package/react-native-webrtc)
  - [react-native-peerjs](https://www.npmjs.com/package/react-native-peerjs)
  - [react-native-push-notification](https://www.npmjs.com/package/react-native-push-notification)
  - [typeorm](https://www.npmjs.com/package/typeorm) in conjunction with [react-native-sqlite-storage](https://www.npmjs.com/package/react-native-sqlite-storage)
  - [redux](https://redux.js.org/)

- **Relay Server / Key Server**

  - [TypeScript](https://www.typescriptlang.org/)
  - [express](https://expressjs.com/)
  - [openpgp](https://www.npmjs.com/package/openpgp)
  - [crypto.js](https://www.npmjs.com/package/crypto-js)
  - [socket.io](https://socket.io/)
  - [peer](https://peerjs.com/)
  - [firebase-admin](https://www.npmjs.com/package/firebase-admin)
  - [sequelize](https://sequelize.org/)

- **Web Presentation**
  - [Svelte](https://svelte.dev/)
  - [vite](https://vitejs.dev/)
  - [tailwind](https://tailwindcss.com/)
