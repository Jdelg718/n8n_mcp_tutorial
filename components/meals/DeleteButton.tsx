'use client';

import { useState } from 'react';
import { deleteMeal } from '@/app/dashboard/meals/actions';

export function DeleteButton({ mealId }: { mealId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this meal? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteMeal(mealId);

    if (!result.success) {
      alert(result.error || 'Failed to delete meal');
      setIsDeleting(false);
    }
    // On success, revalidatePath in deleteMeal refreshes the page
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
