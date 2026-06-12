// Simple stats utilities for Vitacora

// Compute longest streak and current streak from an array of entry dates (ISO strings)
export function computeStreaks(dates = []) {
  if (!dates.length) return { longest: 0, current: 0 }
  const days = Array.from(new Set(dates.map(d => (new Date(d)).toISOString().slice(0,10))))
  days.sort()
  let longest = 0, current = 0, prev = null
  for (const d of days) {
    if (!prev) { current = 1 }
    else {
      const diff = (new Date(d) - new Date(prev)) / (1000*60*60*24)
      if (diff === 1) current += 1
      else current = 1
    }
    if (current > longest) longest = current
    prev = d
  }
  // current streak: check if last day is today or yesterday
  const last = new Date(days[days.length-1])
  const today = new Date(); today.setHours(0,0,0,0)
  const delta = (today - last)/(1000*60*60*24)
  const currentStreak = (delta === 0 || delta === 1) ? current : 0
  return { longest, current: currentStreak }
}

export function frequencyPerWeek(dates = []) {
  // returns average frequency per week
  if (!dates.length) return 0
  const msPerWeek = 7*24*60*60*1000
  const first = new Date(Math.min(...dates.map(d=>new Date(d))))
  const last = new Date(Math.max(...dates.map(d=>new Date(d))))
  const weeks = Math.max(1, Math.ceil((last - first)/msPerWeek))
  return Math.round((dates.length / weeks) * 100)/100
}
