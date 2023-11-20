import { LogService } from 'matrix-bot-sdk'
import path from 'path'
import { mkdir } from 'fs/promises'

const KEY = 'm.room.member'


const handle = (client, archiveRootPath) => async (roomId, event) => {
  const myUserId = await client.getUserId()
  if (event.content.membership !== 'invite' || event.state_key !== myUserId) {
    LogService.warn(KEY, `Received ${event.content.membership} for ${event.state_key}`)
    return
  }

  const roomArchivePath = path.join(
                            archiveRootPath, 
                            roomId.replaceAll('!','').replaceAll(':','.'),
                            'content'
                          )

  try {
    await mkdir(roomArchivePath, { recursive: true })
    LogService.debug(KEY, `created archive folder ${roomArchivePath}`)
    await client.joinRoom(roomId)
    LogService.debug(KEY, `joined ${roomId}`)
  } catch (error) {
    LogService.error(KEY, error.message)
  }

}

export const register = (client, handler, archiveRootPath) => {
  handler[KEY] = handle(client, archiveRootPath)
}
