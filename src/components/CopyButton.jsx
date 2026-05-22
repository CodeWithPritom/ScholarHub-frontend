import { useState } from 'react'
import { copyToClipboard } from '../utils/citationUtils'
import { Copy, Check } from 'lucide-react'

const CopyButton = ({ text, label = '' }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 px-1.5 py-1 rounded-lg transition-all duration-200 ${
        copied
          ? 'bg-green-50 text-green-600'
          : 'text-slate-300 hover:text-blue-600 hover:bg-blue-50'
      }`}
      title={copied ? 'Copied!' : `Copy ${label}`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  )
}

export default CopyButton
