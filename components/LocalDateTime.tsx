'use client'

import { useEffect, useState } from 'react'

interface LocalDateTimeProps {
    date: string | Date
    formatOptions?: Intl.DateTimeFormatOptions
    className?: string
}

const defaultFormatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
}

/**
 * Client-side date/time formatter that displays dates in the user's local timezone.
 * Uses native toLocaleString() to ensure proper browser timezone handling.
 * Renders a placeholder during SSR to avoid hydration mismatch.
 */
export function LocalDateTime({
    date,
    formatOptions = defaultFormatOptions,
    className
}: LocalDateTimeProps) {
    const [formattedDate, setFormattedDate] = useState<string>('')

    useEffect(() => {
        const dateObj = typeof date === 'string' ? new Date(date) : date
        setFormattedDate(dateObj.toLocaleString('en-US', formatOptions))
    }, [date, formatOptions])

    // Show nothing during SSR, then hydrate with correct local time
    if (!formattedDate) {
        return <span className={className}>--</span>
    }

    return <span className={className}>{formattedDate}</span>
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
    const [timeString, setTimeString] = useState<string>('')

    useEffect(() => {
        const dateObj = typeof date === 'string' ? new Date(date) : date
        const now = new Date()
        const diff = now.getTime() - dateObj.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        let result: string
        if (minutes < 1) result = 'Just now'
        else if (minutes < 60) result = `${minutes}m ago`
        else if (hours < 24) result = `${hours}h ago`
        else if (days === 1) result = 'Yesterday'
        else if (days < 7) result = `${days}d ago`
        else result = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

        setTimeString(result)
    }, [date])

    if (!timeString) {
        return <span className={className}>--</span>
    }

    return <span className={className}>{timeString}</span>
}
