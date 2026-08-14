import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Markdown Adapter for UVE Ecosystem
 * Renders high-density Markdown comparison and summary tables with explicit column width sizing
 * and Enterprise Slate aesthetics to prevent text overlap or squashing.
 */
export const MarkdownAdapter = React.memo(({ config, isExpanded = false }) => {
  const tableMarkdown = typeof config === 'string'
    ? config
    : (config?.markdown || config?.table || '');

  if (!tableMarkdown) {
    return null;
  }

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(tableMarkdown);
      toast.success('Copied table data to clipboard!');
    } catch (e) {
      toast.error('Failed to copy data.');
    }
  };

  const cellPadding = isExpanded ? 'p-4' : 'p-3';

  return (
    <div className={`w-full h-full bg-white select-text ${isExpanded ? 'p-2' : 'p-4'} relative group`}>
      <div className="flex justify-end mb-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
          title="Copy Table Data"
        >
          <Copy size={12} className="text-slate-500" />
          <span>Copy Data</span>
        </button>
      </div>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px] w-full text-slate-700 text-xs font-medium">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ node, style, ...props }) => (
                <table
                  style={{ tableLayout: 'auto', minWidth: '800px', ...style }}
                  className="w-full table-auto border-collapse my-2 border border-slate-200/80 rounded-xl overflow-hidden shadow-xs min-w-[800px]"
                  {...props}
                />
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200" {...props} />
              ),
              th: ({ node, children, ...props }) => {
                const text = String(children || '').toLowerCase();
                let widthClass = 'w-auto';
                if (text.includes('paper') || text.includes('title')) {
                  widthClass = 'w-[35%]';
                } else if (text.includes('relevance') || text.includes('score') || text.includes('match')) {
                  widthClass = 'w-[15%]';
                } else if (text.includes('justification') || text.includes('outcome') || text.includes('finding') || text.includes('summary')) {
                  widthClass = 'w-[50%]';
                }
                return (
                  <th className={`px-4 py-3 text-left font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200 ${widthClass} ${cellPadding}`} {...props}>
                    {children}
                  </th>
                );
              },
              tr: ({ node, ...props }) => (
                <tr className="even:bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0" {...props} />
              ),
              td: ({ node, children, ...props }) => (
                <td className={`px-4 py-3 align-top leading-relaxed text-slate-700 break-words whitespace-normal ${cellPadding}`} {...props}>
                  {children}
                </td>
              )
            }}
          >
            {tableMarkdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config) && prevProps.isExpanded === nextProps.isExpanded);

export default MarkdownAdapter;
