import {
  LogLevel,
  LogService,
  MatrixClient,
  RichConsoleLogger,
  RustSdkCryptoStorageProvider,
  SimpleFsStorageProvider
} from "matrix-bot-sdk"

import { config } from 'dotenv'
import * as path from 'path'
import { verify } from './environment.mjs'
import EventHandler from "./EventHandler.mjs"

config()

LogService.setLogger(new RichConsoleLogger())

// For now let's also make sure to log everything (for debugging)
LogService.setLevel(process.env.LOG_LEVEL || LogLevel.DEBUG)

LogService.info('archive-bot starting up ...')

const missing = verify([
'MATRIX_HOMESERVER_URL',
'MATRIX_ACCESS_TOKEN'
])

if (missing.length) {
  missing.forEach(m => LogService.error(`environment variable ${m} has no value`))
  process.exit(1)
}

const dataDir = process.env.DATA_DIR ?? (path.join(process.cwd(), 'data'))
const archiveDir = process.env.ARCHIVE_DIR ?? (path.join(process.cwd(), 'archive'))

const storagePath = path.join(dataDir, 'bot.json')
LogService.debug(`Initializing StorageProvider: ${storagePath}`)
const storage = new SimpleFsStorageProvider(storagePath)

const cryptoStoragePath = path.join(dataDir, 'crypto')
LogService.debug(`Initializing CryptoStorageProvider: ${cryptoStoragePath}`)
const cryptoStorage = new RustSdkCryptoStorageProvider(cryptoStoragePath)

const client = new MatrixClient(process.env.MATRIX_HOMESERVER_URL, process.env.MATRIX_ACCESS_TOKEN, storage, cryptoStorage)

const eventHandler = new EventHandler(client, archiveDir)

await eventHandler.start()
await client.start()
LogService.info('archive-bot is ready')