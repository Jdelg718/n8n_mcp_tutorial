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
