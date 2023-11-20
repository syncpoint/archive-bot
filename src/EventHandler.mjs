import { LogService, MessageEvent, UserID } from 'matrix-bot-sdk'
import { DateTime } from 'luxon'
import { register } from './events/index.mjs'

export default class EventHandler {
  constructor (matrixClient, archiveDir) {
    this.client = matrixClient

    const proxyHandler = {
      get (target, property) {
        return (property in target && typeof target[property] === 'function') ? target[property] : () => LogService.error('handler', `No handler for event type "${property}"`)
      }
    }
    this.handler = new Proxy({}, proxyHandler)

    register(this.client, this.handler, archiveDir)
  }

  async prepareProfile() {
    this.userId = await this.client.getUserId()
    this.localpart = new UserID(this.userId).localpart

    try {
        const profile = await this.client.getUserProfile(this.userId)
        if (profile && profile['displayname']) this.displayName = profile['displayname']
    } catch (e) {
        // Non-fatal error - we'll just log it and move on.
        LogService.warn('EventHandler', e)
    }
  }

  async start () {
    // Populate the variables above (async)
    await this.prepareProfile()

    // Set up the event handler
    this.client.on('room.invite', this.onEvent.bind(this))
    this.client.on('room.event', this.onEvent.bind(this))
  }

  async onEvent(roomId, ev) {
    /* const event = new MessageEvent(ev)
    if (event.isRedacted) return */
    
    
    try {
      const breadCrumbs = [ev.type, ev.content?.msgtype]
      const key = breadCrumbs.filter(Boolean).join('/')
      const handlingFunction = this.handler[key]
      handlingFunction(roomId, ev)
    } catch (error) {
      LogService.error('onEvent', error.message)
    }

  }
}