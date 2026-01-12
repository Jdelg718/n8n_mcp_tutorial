'use client'

import { useState, useEffect } from 'react'
import type { InsightsResponse } from '@/lib/ai/types'

interface InsightsPanelProps {
  startDate: string
  endDate: string
}

export function InsightsPanel({ startDate, endDate }: InsightsPanelProps) {
  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startDate, endDate }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate insights')
      }

      const data: InsightsResponse = await response.json()
      setInsights(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Insights fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate insights')
    } finally {
      setLoading(false)
    }
  }

  // Fetch insights when component mounts or date range changes
  useEffect(() => {
    fetchInsights()
  }, [startDate, endDate])

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Analyzing your nutrition patterns...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchInsights}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!insights) {
    return null
  }

  // Handle empty state (no meals logged)
  if (insights.insights.length === 1 && insights.insights[0].includes('No meals logged')) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Nutrition Analysis</h2>
        <p className="text-gray-600 mb-4">Based on your recent meals</p>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-3">Not enough data for AI analysis.</p>
          <p className="text-gray-500 text-sm">Log more meals to see insights.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Nutrition Analysis</h2>
          <p className="text-sm text-gray-600">Based on your recent meals</p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          Regenerate
        </button>
      </div>

      <div className="space-y-6">
        {/* Insights Section */}
        {insights.insights.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Insights
            </h3>
            <div className="space-y-2">
              {insights.insights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-700"
                >
                  {insight}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {insights.recommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">✅</span>
              Recommendations
            </h3>
            <div className="space-y-2">
              {insights.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="bg-green-50 border border-green-100 rounded-lg p-3 text-gray-700"
                >
                  {recommendation}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concerns Section (only if present) */}
        {insights.concerns.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">⚠️</span>
              Concerns
            </h3>
            <div className="space-y-2">
              {insights.concerns.map((concern, index) => (
                <div
                  key={index}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-gray-700"
                >
                  {concern}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {lastUpdated && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}
