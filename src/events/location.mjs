import { LogService } from 'matrix-bot-sdk'
import { hsISOTimestamp } from './commons.mjs'
import path from 'path'
import { appendFile } from 'fs/promises'

const LOCATION_KEY = 'm.room.message/m.location'
const BEACON_KEY = 'org.matrix.msc3672.beacon'
const PREFIX = 'org.matrix.msc3488'

const handle = (client, archiveRootPath) => async (roomId, event) => {
  const key = event.type === BEACON_KEY ? BEACON_KEY : LOCATION_KEY

  LogService.debug(key, 'handling location message')
  const tsPropertyName = `${PREFIX}.ts`
  const locationTS = event.content[tsPropertyName]
  const locationTSISO = hsISOTimestamp(locationTS)
  const location = event.content[`${PREFIX}.location`].uri
  const content = ['']
  content.push(`#### ${hsISOTimestamp(event.origin_server_ts)} - ${event.sender}`)
  content.push(`Standort um ${locationTSISO}: ${location}`)

  const outputPath = path.join(
                      archiveRootPath,
                      roomId.replaceAll('!','').replaceAll(':','.'),
                      'index.md'
                    )

  try {
    await appendFile(outputPath, content.join('\n'))
    client.sendReadReceipt(roomId, event.event_id)
    LogService.debug(key, `appended new entry to ${outputPath}`)
  } catch (error) {
    LogService.error(key, error.message)
  }
}

export const register = (client, handler, archiveRootPath) => {
  handler[LOCATION_KEY] = handle(client, archiveRootPath)
  handler[BEACON_KEY] = handle(client, archiveRootPath)
}