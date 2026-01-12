'use client';

import { type NutritionResponse } from '@/lib/ai/types';

interface NutritionDisplayProps {
  nutrition: NutritionResponse;
  onUpdate: (field: string, value: number) => void;
}

/**
 * Display and edit nutrition data from AI analysis
 *
 * Shows primary macros (calories, protein, carbs, fat)
 * with confidence badge and editable inputs for manual override.
 */
export default function NutritionDisplay({
  nutrition,
  onUpdate,
}: NutritionDisplayProps) {
  const { calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg } =
    nutrition.nutrition;

  // Confidence badge styling
  const confidenceColors = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          AI Nutrition Analysis
        </h3>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            confidenceColors[nutrition.confidence]
          }`}
        >
          {nutrition.confidence} confidence
        </span>
      </div>

      {/* Show notes if confidence is low */}
      {nutrition.confidence === 'low' && nutrition.notes && (
        <div className="text-xs text-gray-600 bg-white rounded p-2 border border-gray-200">
          <strong>Note:</strong> {nutrition.notes}
        </div>
      )}

      {/* Primary macros - editable */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Calories
          </label>
          <input
            type="number"
            value={calories}
            onChange={(e) => onUpdate('calories', Number(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Protein (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={protein_g}
            onChange={(e) => onUpdate('protein', Number(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Carbs (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={carbs_g}
            onChange={(e) => onUpdate('carbs', Number(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fat (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={fat_g}
            onChange={(e) => onUpdate('fat', Number(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-900 bg-white"
          />
        </div>

        {/* Secondary nutrients */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fiber (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={fiber_g}
            onChange={(e) => onUpdate('fiber', Number(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Sugar (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={sugar_g}
            onChange={(e) => onUpdate('sugar', Number(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Sodium (mg)
          </label>
          <input
            type="number"
            step="1"
            value={sodium_mg}
            onChange={(e) => onUpdate('sodium', Number(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-900 bg-white"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 italic">
        You can edit any values above before saving.
      </p>
    </div>
  );
}
