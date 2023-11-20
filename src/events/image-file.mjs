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
    const file = event.content.file || { url: event.content.url }
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
      
  #### ${hsISOTimestamp(event.origin_server_ts)} - ${event.sender}
  ${event.content.msgtype === 'm.image' ? '!' : ''}[${event.content.body}](./content/${event.event_id.replace('$','')}_${event.content.body})
  `
    await appendFile(outputPath, journalEntry)
    client.sendReadReceipt(roomId, event.event_id)
    LogService.debug(LOG_KEY, `appended new entry to ${outputPath}`)
  } catch (error) {
    LogService.error(LOG_KEY, error.message)
  }
}

export const register = (client, handler, archiveRootPath) => {
  handler[FILE_KEY] = handle(client, archiveRootPath)
  handler[IMAGE_KEY] = handle(client, archiveRootPath)
}
