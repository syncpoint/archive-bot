import { register as invite } from './invite.mjs'
import { register as text } from './text.mjs'
import { register as imageFile } from './image-file.mjs'
import { register as location } from './location.mjs'

export const register = (client, handler, archiveRootPath) => {
  invite(client, handler, archiveRootPath)
  imageFile(client, handler, archiveRootPath)
  location(client, handler, archiveRootPath)
  text(client, handler, archiveRootPath)
}