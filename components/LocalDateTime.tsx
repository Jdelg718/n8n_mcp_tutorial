'use client'

import { format } from 'date-fns'

interface LocalDateTimeProps {
    date: string | Date
    formatString?: string
    className?: string
}

/**
 * Client-side date/time formatter that displays dates in the user's local timezone.
 * Use this instead of format() in server components to ensure proper timezone handling.
 */
export function LocalDateTime({
    date,
    formatString = 'MMM d, yyyy h:mm a',
    className
}: LocalDateTimeProps) {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    return (
        <span className={className}>
            {format(dateObj, formatString)}
        </span>
    )
}

/**
 * Client-side relative time formatter.
 * Shows times like "5m ago", "2h ago", "Yesterday", etc. in the user's local timezone.
 */
export function RelativeTime({
    date,
    className
}: {
    date: string | Date
    className?: string
}) {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    let timeString: string
    if (minutes < 1) timeString = 'Just now'
    else if (minutes < 60) timeString = `${minutes}m ago`
    else if (hours < 24) timeString = `${hours}h ago`
    else if (days === 1) timeString = 'Yesterday'
    else if (days < 7) timeString = `${days}d ago`
    else timeString = dateObj.toLocaleDateString()

    return <span className={className}>{timeString}</span>
}
