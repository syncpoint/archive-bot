import { LogService } from 'matrix-bot-sdk'
import path from 'path'
import { appendFile } from 'fs/promises'
import { hsISOTimestamp } from './commons.mjs'


const FILE_KEY = 'm.room.message/m.file'
const IMAGE_KEY = 'm.room.message/m.image'

const LOG_KEY = 'm.room.message/[m.image|m.file]'

const handle = (client, archiveRootPath) => async (roomId, event) => {
  LogService.debug(LOG_KEY, 'handling image or file messages')
  try {
    const file = event.content.file
    const content = file.key 
      ? (await client.crypto.decryptMedia(file))
      : (await client.downloadContent(file.url)).data

    const filePath = path.join(
      archiveRootPath, 
      roomId.replaceAll('!','').replaceAll(':','.'),
      'content', 
      `${event.event_id.replace('$','')}_${event.content.body}`
    )    
    await appendFile(filePath, content)
    LogService.info(`persisted content to ${filePath}`)

    const outputPath = path.join(
      archiveRootPath,
      roomId.replaceAll('!','').replaceAll(':','.'),
      'index.md'
    )
    const journalEntry = 
  `
      
  #### ${hsISOTimestamp(event)} - ${event.sender}
  ${event.content.msgtype === 'm.image' ? '!' : ''}[${event.content.body}](./content/${event.event_id.replace('$','')}_${event.content.body})
  `
    await appendFile(outputPath, journalEntry)
    LogService.debug(LOG_KEY, `appended new entry to ${outputPath}`)
  } catch (error) {
    LogService.error(LOG_KEY, error.message)
  }

  
}

export const register = (client, handler, archiveRootPath) => {
  handler[FILE_KEY] = handle(client, archiveRootPath)
  handler[IMAGE_KEY] = handle(client, archiveRootPath)
}



/*

{
  type: "m.room.message",
  sender: "@rocky:thomass-macbook-pro.local",
  content: {
    body: "ODIN-blocked.jpeg",
    file: {
      hashes: {
        sha256: "qJkf16R1/LVL9ImKrOq68h9wlCfhl/yMp6uQZcjS/2s",
      },
      iv: "bnplKbfyFtYAAAAAAAAAAA",
      key: {
        alg: "A256CTR",
        ext: true,
        k: "0HD7yGyk0nijgFFP007S34F1kZsPRQHK315FjS1QZ2I",
        key_ops: [
          "encrypt",
          "decrypt",
        ],
        kty: "oct",
      },
      url: "mxc://thomass-macbook-pro.local/AcvrILQmVUZQZZiyGqejzfWD",
      v: "v2",
    },
    info: {
      h: 900,
      mimetype: "image/jpeg",
      size: 268238,
      thumbnail_file: {
        hashes: {
          sha256: "FiiqBcqV2uMMCPUR/x9Q8XmzrSzailoMGDgcMsVGvRE",
        },
        iv: "kE6P7yOHRF4AAAAAAAAAAA",
        key: {
          alg: "A256CTR",
          ext: true,
          k: "lti9sXBgllQCqJfaK9vJskaplNPl7voyFA6_ug8ghBE",
          key_ops: [
            "encrypt",
            "decrypt",
          ],
          kty: "oct",
        },
        url: "mxc://thomass-macbook-pro.local/tbXeDCqDFgzTjfqEMJgZntfQ",
        v: "v2",
      },
      thumbnail_info: {
        h: 450,
        mimetype: "image/jpeg",
        size: 201813,
        w: 800,
      },
      w: 1600,
      "xyz.amorgan.blurhash": "L8GlO^%f00R5t9afoafi00WB~qWV",
    },
    msgtype: "m.image",
  },
  origin_server_ts: 1699015243891,
  unsigned: {
    age: 55,
  },
  event_id: "$7TX90TLjglFc5ks3TilseH8Upg1jccPw1OScoMc0wuk",
}


{
  type: "m.room.message",
  sender: "@rocky:thomass-macbook-pro.local",
  content: {
    body: "Dax_Silverstone_2024_Angebot_1.pdf",
    file: {
      hashes: {
        sha256: "3QnSQ2w6wgkX5GNvgSbepZIYl/oMkkQ5icKqnbTg2zs",
      },
      iv: "MiSQNb3zWKoAAAAAAAAAAA",
      key: {
        alg: "A256CTR",
        ext: true,
        k: "oY01e-HraM6DzLg-XqVO6UVrM9C89YOGAlmoi38RU-U",
        key_ops: [
          "encrypt",
          "decrypt",
        ],
        kty: "oct",
      },
      url: "mxc://thomass-macbook-pro.local/oYVKOKZbVWeuQCIrMDxVTHFx",
      v: "v2",
    },
    info: {
      mimetype: "application/pdf",
      size: 178261,
    },
    msgtype: "m.file",
  },
  origin_server_ts: 1699015346255,
  unsigned: {
    age: 61,
  },
  event_id: "$yFQ00bMx-rBBInaxZWvtyGDQ8O0Vp5VGb7nNppBrld8",
}


*/