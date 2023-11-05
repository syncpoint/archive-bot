import { DateTime } from 'luxon'

const hsISOTimestamp = (event) => {
  const ts = DateTime.fromMillis(event.origin_server_ts)
  return ts.toISO({ suppressMilliseconds: true })
}

export {
  hsISOTimestamp
}