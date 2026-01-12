'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export type FilterState = {
  dateRange: string
  mealType: string
  search: string
}

export function MealFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize state from URL params
  const [dateRange, setDateRange] = useState(searchParams.get('dateRange') || 'all')
  const [mealType, setMealType] = useState(searchParams.get('mealType') || 'all')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Update URL when filters change (reset to page 1)
  useEffect(() => {
    const params = new URLSearchParams()

    if (dateRange !== 'all') params.set('dateRange', dateRange)
    if (mealType !== 'all') params.set('mealType', mealType)
    if (debouncedSearch) params.set('search', debouncedSearch)
    // Don't include page param - will default to 1

    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : '/dashboard/meals'

    router.push(newUrl)
  }, [dateRange, mealType, debouncedSearch, router])

  const hasActiveFilters = dateRange !== 'all' || mealType !== 'all' || search !== ''

  const clearFilters = () => {
    setDateRange('all')
    setMealType('all')
    setSearch('')
    setDebouncedSearch('')
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Date Range Filter */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            id="dateRange"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last-7-days">Last 7 days</option>
            <option value="last-30-days">Last 30 days</option>
            <option value="this-month">This month</option>
            <option value="last-month">Last month</option>
          </select>
        </div>

        {/* Meal Type Filter */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-1">
            Meal Type
          </label>
          <select
            id="mealType"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All types</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meals..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
