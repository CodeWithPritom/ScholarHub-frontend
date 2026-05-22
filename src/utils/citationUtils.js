/**
 * Citation Generator Utilities
 * Generates APA, MLA, and Harvard style citations from article metadata.
 */

/**
 * Copy text to clipboard with fallback
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  }
}

/**
 * Extract year from article date string like "01 Jan 2025"
 */
const extractYear = (article) => {
  if (article.year) return article.year
  const match = article.date?.match(/\d{4}/)
  return match ? match[0] : 'n.d.'
}

/**
 * Format authors for APA: "LastName, F. M., & LastName, F. M."
 */
const formatAuthorsAPA = (article) => {
  const authors = article.full_authors || []
  if (authors.length === 0) return article.authors || 'Unknown'
  
  const formatted = authors.map(a => {
    const parts = a.split(', ')
    if (parts.length >= 2) {
      const initials = parts[1].split(' ').map(n => n.charAt(0) + '.').join(' ')
      return `${parts[0]}, ${initials}`
    }
    return a
  })

  if (formatted.length === 1) return formatted[0]
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`
  if (formatted.length <= 20) {
    return formatted.slice(0, -1).join(', ') + ', & ' + formatted[formatted.length - 1]
  }
  return formatted.slice(0, 19).join(', ') + ', ... ' + formatted[formatted.length - 1]
}

/**
 * Format authors for MLA: "LastName, FirstName, et al."
 */
const formatAuthorsMLA = (article) => {
  const authors = article.full_authors || []
  if (authors.length === 0) return article.authors || 'Unknown'
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return `${authors[0]}, and ${authors[1]}`
  return `${authors[0]}, et al.`
}

/**
 * Format authors for Harvard: "LastName, F.M."
 */
const formatAuthorsHarvard = (article) => {
  const authors = article.full_authors || []
  if (authors.length === 0) return article.authors || 'Unknown'
  
  const formatted = authors.map(a => {
    const parts = a.split(', ')
    if (parts.length >= 2) {
      const initials = parts[1].split(' ').map(n => n.charAt(0) + '.').join('')
      return `${parts[0]}, ${initials}`
    }
    return a
  })

  if (formatted.length === 1) return formatted[0]
  if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`
  if (formatted.length <= 3) {
    return formatted.slice(0, -1).join(', ') + ' and ' + formatted[formatted.length - 1]
  }
  return `${formatted[0]} et al.`
}

/**
 * Build volume/issue string like "12(3)"
 */
const volIssue = (article) => {
  const v = article.volume || ''
  const i = article.issue || ''
  if (v && i) return `${v}(${i})`
  if (v) return v
  return ''
}

/**
 * Generate all three citation styles
 */
export const generateCitations = (article) => {
  const year = extractYear(article)
  const title = article.title?.replace(/\.$/, '') || 'Untitled'
  const journal = article.journal || 'Unknown Journal'
  const doi = article.doi ? `https://doi.org/${article.doi}` : ''
  const vi = volIssue(article)

  // APA 7th Edition
  const apaAuthors = formatAuthorsAPA(article)
  let apa = `${apaAuthors} (${year}). ${title}. *${journal}*`
  if (vi) apa += `, *${vi}*`
  apa += '.'
  if (doi) apa += ` ${doi}`

  // MLA 9th Edition
  const mlaAuthors = formatAuthorsMLA(article)
  let mla = `${mlaAuthors}. "${title}." *${journal}*`
  if (article.volume) mla += `, vol. ${article.volume}`
  if (article.issue) mla += `, no. ${article.issue}`
  mla += `, ${year}.`
  if (doi) mla += ` ${doi}.`

  // Harvard
  const harvardAuthors = formatAuthorsHarvard(article)
  let harvard = `${harvardAuthors} (${year}) '${title}', *${journal}*`
  if (vi) harvard += `, ${vi}`
  harvard += '.'
  if (doi) harvard += ` doi: ${article.doi}.`

  return { apa, mla, harvard }
}

/**
 * Generate a single citation by style name
 */
export const generateCitation = (paper, style) => {
  const citations = generateCitations(paper)
  return citations[style.toLowerCase()] || citations.apa
}
