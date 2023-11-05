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



  /*
  {
  type: "m.room.member",
  sender: "@rocky:thomass-macbook-pro.local",
  content: {
    membership: "invite",
    displayname: "archie",
  },
  state_key: "@archie:thomass-macbook-pro.local",
  origin_server_ts: 1699006217708,
  unsigned: {
    replaces_state: "$XLnCHOei1FuL1vqUgePYxLX6vMv2u0--6Kp57m5JUK4",
    prev_content: {
      membership: "leave",
    },
    prev_sender: "@rocky:thomass-macbook-pro.local",
    age: 116,
  },
  event_id: "$zZFUMVpKulmB5CiuQcVj-1HEbaEbIGrXkZQcgqEs6NU",
}
  */
  
  const roomArchivePath = path.join(
                            archiveRootPath, 
                            roomId.replaceAll('!','').replaceAll(':','.'),
                            content
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
