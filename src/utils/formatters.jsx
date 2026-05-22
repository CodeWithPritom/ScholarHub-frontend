/**
 * Utility to format abstract text with sub-headers
 */
export const formatAbstract = (text) => {
  if (!text) return null
  
  const sections = ['OBJECTIVE', 'METHODS', 'RESULTS', 'CONCLUSIONS', 'IMPORTANCE', 'BACKGROUND', 'DESIGN', 'SETTING', 'PARTICIPANTS', 'MAIN OUTCOME MEASURES', 'RESULTS', 'CONCLUSIONS AND RELEVANCE']
  
  const regex = new RegExp(`(${sections.join('|')}):`, 'g')
  const parts = text.split(regex)
  
  if (parts.length === 1) return <p className="leading-relaxed mb-6">{text}</p>
  
  const formatted = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (sections.includes(part)) {
      formatted.push(<h4 key={`h-${i}`} className="text-sm font-black text-slate-900 mt-8 mb-3 uppercase tracking-widest">{part}</h4>)
    } else if (part.trim()) {
      formatted.push(<p key={`p-${i}`} className="leading-relaxed mb-4 text-slate-700">{part.trim()}</p>)
    }
  }
  
  return formatted
}

/**
 * Minimal Markdown-lite formatter for AI summaries
 */
export const formatMarkdown = (text) => {
  if (!text) return null
  
  const paragraphs = text.split('\n\n')
  
  return paragraphs.map((para, i) => {
    if (para.trim().startsWith('- ') || para.trim().startsWith('* ')) {
      const items = para.split('\n').map(line => line.replace(/^[-*]\s+/, '').trim())
      return (
        <ul key={i} className="list-disc ml-6 mb-6 space-y-2">
          {items.map((item, j) => <li key={j}>{parseInline(item)}</li>)}
        </ul>
      )
    }
    
    return <p key={i} className="mb-6 leading-relaxed">{parseInline(para)}</p>
  })
}

/**
 * Parse inline bold **text**
 */
export const parseInline = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-black text-slate-900">{part.slice(2, -2)}</strong>
    }
    return part
  })
}
