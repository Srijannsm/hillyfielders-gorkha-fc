import { useRef, useState } from 'react'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 50 * 1024 * 1024

export default function ImageUpload({ name, label, currentUrl, onChange }) {
  const inputRef = useRef()
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return

    if (!ALLOWED_TYPES.has(file.type)) {
      setError('Only JPG, PNG, WebP, and GIF images are allowed.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be smaller than 50 MB.')
      e.target.value = ''
      return
    }

    setError(null)
    setPreview(URL.createObjectURL(file))
    onChange(file)
  }

  const displayed = preview || currentUrl

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        className="relative cursor-pointer rounded-lg border-2 border-dashed border-gray-200 hover:border-[#a3e635] transition-colors overflow-hidden"
      >
        {displayed ? (
          <div className="relative h-36">
            <img src={displayed} alt="preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium">Change image</span>
            </div>
          </div>
        ) : (
          <div className="h-36 flex flex-col items-center justify-center gap-2 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Click to upload</span>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept=".jpg,.jpeg,.png,.webp,.gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
