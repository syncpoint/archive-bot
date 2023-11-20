import { DateTime } from 'luxon'

const hsISOTimestamp = (ts) => {
  const pointInTime = DateTime.fromMillis(ts)
  return pointInTime.toISO({ suppressMilliseconds: true })
}

export {
  hsISOTimestamp
}