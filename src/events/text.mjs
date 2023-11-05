import { LogService } from 'matrix-bot-sdk'
import { hsISOTimestamp } from './commons.mjs'
import path from 'path'
import { appendFile } from 'fs/promises'

const key = 'm.room.message/m.text'

const handle = (client, archiveRootPath) => async (roomId, event) => {
  LogService.debug(key, 'handling text message')
  const content = ['']
  content.push(`#### ${hsISOTimestamp(event)} - ${event.sender}`)
  content.push(event.content.body)

  const outputPath = path.join(
                      archiveRootPath,
                      roomId.replaceAll('!','').replaceAll(':','.'),
                      'index.md'
                    )

  try {
    await appendFile(outputPath, content.join('\n'))
    LogService.debug(key, `appended new entry to ${outputPath}`)
  } catch (error) {
    LogService.error(key, error.message)
  }
}

export const register = (client, handler, archiveRootPath) => {
  handler[key] = handle(client, archiveRootPath)
}