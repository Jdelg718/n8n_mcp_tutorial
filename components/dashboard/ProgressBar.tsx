type ProgressBarProps = {
  label: string
  value: number
  max: number
  unit: string
  color?: string
}

export function ProgressBar({ label, value, max, unit, color = 'blue' }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  // Determine fill color based on percentage
  let fillColor: string
  if (percentage >= 100) {
    fillColor = 'bg-red-500'
  } else if (percentage >= 80) {
    fillColor = 'bg-yellow-500'
  } else {
    fillColor = 'bg-green-500'
  }

  // Determine label color based on macro type
  const labelColors: Record<string, string> = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600',
  }

  const labelColor = labelColors[color] || 'text-gray-900'

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className={`text-sm font-semibold ${labelColor}`}>{label}</span>
        <span className="text-sm text-gray-600">
          {value} / {max} {unit}
        </span>
      </div>
      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${fillColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
        {percentage > 20 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        {percentage <= 20 && (
          <div className="absolute inset-0 flex items-center pl-2">
            <span className="text-xs font-semibold text-gray-700">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
