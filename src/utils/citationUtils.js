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

/**
 * Export Helper: Download Blob as File
 */
export const downloadFile = (content, filename, mimeType = 'text/plain;charset=utf-8;') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate BibTeX (.bib) file for Zotero, EndNote, LaTeX
 */
export const generateBibTeX = (papers) => {
  if (!Array.isArray(papers) || papers.length === 0) return '';
  return papers.map((paper, idx) => {
    const meta = paper.full_metadata || paper;
    const authors = Array.isArray(paper.full_authors) && paper.full_authors.length > 0 
      ? paper.full_authors.join(' and ')
      : (typeof paper.authors === 'string' ? paper.authors : 'Unknown Author');
    const year = paper.year || extractYear(paper) || '2025';
    const firstAuthor = (authors.split(',')[0] || authors.split(' ')[0] || 'paper').replace(/[^a-zA-Z]/g, '');
    const citeKey = `${firstAuthor.toLowerCase()}${year}_p${idx + 1}`;
    const title = (paper.title || meta.title || 'Untitled').replace(/[{}]/g, '');
    const journal = paper.journal || meta.journal || paper.database || 'Academic Journal';
    const doi = paper.doi || meta.doi || '';
    const url = paper.url || paper.link || meta.url || '';
    const abstract = (paper.abstract || paper.summary || meta.abstract || '').replace(/[\r\n]+/g, ' ').replace(/"/g, "'");

    let bib = `@article{${citeKey},\n`;
    bib += `  author = {${authors}},\n`;
    bib += `  title = {{${title}}},\n`;
    bib += `  journal = {${journal}},\n`;
    bib += `  year = {${year}}`;
    if (paper.volume || meta.volume) bib += `,\n  volume = {${paper.volume || meta.volume}}`;
    if (paper.issue || meta.issue) bib += `,\n  number = {${paper.issue || meta.issue}}`;
    if (doi) bib += `,\n  doi = {${doi}}`;
    if (url) bib += `,\n  url = {${url}}`;
    if (abstract) bib += `,\n  abstract = {${abstract.substring(0, 1000)}}`;
    bib += `\n}`;
    return bib;
  }).join('\n\n');
};

/**
 * Generate RIS (.ris) file for Reference Managers
 */
export const generateRIS = (papers) => {
  if (!Array.isArray(papers) || papers.length === 0) return '';
  return papers.map((paper) => {
    const meta = paper.full_metadata || paper;
    const lines = ['TY  - JOUR'];
    lines.push(`TI  - ${paper.title || meta.title || 'Untitled'}`);
    const authors = Array.isArray(paper.full_authors) && paper.full_authors.length > 0 
      ? paper.full_authors 
      : [typeof paper.authors === 'string' ? paper.authors : 'Unknown Author'];
    authors.forEach(a => lines.push(`AU  - ${a}`));
    const year = paper.year || extractYear(paper) || '2025';
    lines.push(`PY  - ${year}`);
    if (paper.journal || meta.journal) lines.push(`JO  - ${paper.journal || meta.journal}`);
    if (paper.volume || meta.volume) lines.push(`VL  - ${paper.volume || meta.volume}`);
    if (paper.issue || meta.issue) lines.push(`IS  - ${paper.issue || meta.issue}`);
    if (paper.doi || meta.doi) lines.push(`DO  - ${paper.doi || meta.doi}`);
    if (paper.url || paper.link || meta.url) lines.push(`UR  - ${paper.url || paper.link || meta.url}`);
    if (paper.abstract || paper.summary || meta.abstract) lines.push(`AB  - ${(paper.abstract || paper.summary || meta.abstract).replace(/[\r\n]+/g, ' ')}`);
    lines.push('ER  - ');
    return lines.join('\n');
  }).join('\n\n');
};

/**
 * Generate Formatted APA 7th Bibliography (.txt / .bib)
 */
export const generateAPABibliographyText = (papers) => {
  if (!Array.isArray(papers) || papers.length === 0) return '';
  const list = papers.map((paper, idx) => {
    const citations = generateCitations(paper);
    return `[${idx + 1}] ${citations.apa}`;
  }).join('\n\n');

  return `============================================================\nACADEMIC BIBLIOGRAPHY (APA 7TH EDITION)\nGenerated by ScholarHub AI — Total References: ${papers.length}\n============================================================\n\n${list}`;
};

/**
 * Generate Structured CSV for Excel (.csv with UTF-8 BOM)
 */
export const generateExcelCSV = (papers, additionalContent = '') => {
  if (!Array.isArray(papers) || papers.length === 0) {
    if (additionalContent) {
      return '\uFEFF' + additionalContent;
    }
    return '';
  }

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
    return `"${str}"`;
  };

  const headers = ['Paper ID', 'Title', 'Authors', 'Journal / Source', 'Year', 'DOI', 'URL / Link', 'Abstract'];
  const rows = papers.map((p, idx) => {
    const meta = p.full_metadata || p;
    const authors = Array.isArray(p.full_authors) ? p.full_authors.join('; ') : (p.authors || 'Unknown');
    const year = p.year || extractYear(p) || 'n.d.';
    const title = p.title || meta.title || 'Untitled';
    const journal = p.journal || meta.journal || p.database || 'Database';
    const doi = p.doi || meta.doi || '';
    const url = p.url || p.link || meta.url || '';
    const abstract = p.abstract || p.summary || meta.abstract || '';

    return [
      idx + 1,
      escapeCSV(title),
      escapeCSV(authors),
      escapeCSV(journal),
      escapeCSV(year),
      escapeCSV(doi),
      escapeCSV(url),
      escapeCSV(abstract)
    ].join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\n');
};

/**
 * Generate Structured JSON File
 */
export const generateStructuredJSON = (papers, content = '') => {
  const payload = {
    exported_at: new Date().toISOString(),
    total_papers: papers?.length || 0,
    papers: papers || [],
    analysis_content: content || ''
  };
  return JSON.stringify(payload, null, 2);
};
