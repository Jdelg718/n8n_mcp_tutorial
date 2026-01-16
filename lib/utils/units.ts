// Unit conversion utilities
export const kgToLbs = (kg: number): number => kg * 2.20462
export const lbsToKg = (lbs: number): number => lbs / 2.20462

export const cmToInches = (cm: number): number => cm / 2.54
export const inchesToCm = (inches: number): number => inches * 2.54

// Convert inches to feet and inches display
export const inchesToFeetInches = (totalInches: number): { feet: number; inches: number } => {
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    return { feet, inches }
}

// Convert feet and inches to total inches
export const feetInchesToInches = (feet: number, inches: number): number => {
    return feet * 12 + inches
}
