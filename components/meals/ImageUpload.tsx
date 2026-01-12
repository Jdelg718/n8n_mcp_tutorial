'use client'

import { useState, useRef } from 'react'
import Compressor from 'compressorjs'
import { getUploadUrl } from '@/app/(dashboard)/meals/actions'
import { getPublicUrl } from '@/lib/storage/images'
import Image from 'next/image'

type ImageUploadProps = {
  value?: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        maxWidth: 1200,
        quality: 0.8,
        convertSize: 1000000, // Convert to WebP if > 1MB
        mimeType: 'image/webp',
        success: (result) => resolve(result),
        error: (err) => reject(err),
      })
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError('Please select a valid image (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (max 20MB before compression)
    if (file.size > 20 * 1024 * 1024) {
      setError('Image too large. Please select an image under 20MB.')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Compress image
      const compressedBlob = await compressImage(file)

      // Get signed upload URL
      const { signedUrl, path } = await getUploadUrl(file.name)

      // Upload directly to Supabase Storage
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: compressedBlob,
        headers: {
          'Content-Type': 'image/webp',
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      // Get public URL
      const publicUrl = getPublicUrl(path)
      onChange(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      onChange(null)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onChange(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Meal Photo (optional)
      </label>

      {value ? (
        <div className="space-y-3">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
            <Image
              src={value}
              alt="Meal preview"
              fill
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove Image
          </button>
        </div>
      ) : (
        <div>
          <label
            htmlFor="image-upload"
            className={`
              relative block w-full px-4 py-8 border-2 border-dashed rounded-lg
              text-center cursor-pointer transition-colors
              ${isUploading || disabled
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-blue-400 bg-white'
              }
            `}
          >
            <input
              ref={fileInputRef}
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={disabled || isUploading}
              className="sr-only"
            />
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <span className="text-sm text-gray-600">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg
                  className="h-10 w-10 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  JPEG, PNG, or WebP (max 20MB)
                </span>
              </div>
            )}
          </label>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
