const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

/** `Oct 3, 2026` */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

/** `Oct 3, 2026, 2:00 PM` */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}
