import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Activity, Download, Layout, ZoomIn, ZoomOut, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import html2canvas from 'html2canvas';

try {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'default',
    flowchart: {
      htmlLabels: true,
      wrap: true,
      useMaxWidth: false,
      curve: 'basis'
    },
    themeVariables: {
      fontSize: '13px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  });
} catch (e) { }

export const sanitizeMermaid = (code) => {
  if (!code) return '';
  let sanitized = code.trim();

  // Clean markdown block wrappers if they exist
  sanitized = sanitized.replace(/^```mermaid/i, '').replace(/```$/g, '').trim();

  // Strip :::classDef or :::method suffixes from node references
  sanitized = sanitized.replace(/:::[a-zA-Z0-9_-]+/g, '');

  // Strip classDef and class assignment statements that cause parse failures
  sanitized = sanitized
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('classDef') && !trimmed.startsWith('class ');
    })
    .join('\n');

  // Fix specific arrow label hallucination (e.g., -->|Text|>)
  sanitized = sanitized.replace(/(-->\|[^|]+)\|>/g, '$1|');

  // Ensure valid graph TD or flowchart TD start
  sanitized = sanitized.replace(/^["'\s]*graph/i, 'graph');
  sanitized = sanitized.replace(/^["'\s]*flowchart/i, 'flowchart');

  // Auto-quote unquoted labels containing parentheses e.g. A[Hyperspectral Imaging (1)] -> A["Hyperspectral Imaging (1)"]
  sanitized = sanitized.replace(/([a-zA-Z0-9_-]+)\[\s*([^"\]\n]+?\([^\n\]]*?\)[^\n\]]*?)\s*\]/g, (match, nodeId, label) => {
    const cleanLabel = label.replace(/"/g, "'").trim();
    return `${nodeId}["${cleanLabel}"]`;
  });

  // Clean labels inside node brackets cleanly and replace newlines inside quotes
  sanitized = sanitized.replace(/\[\s*"([\s\S]*?)"\s*\]/g, (match, p1) => {
    const cleanLabel = p1.replace(/"/g, "'").replace(/\\n/g, ' ').replace(/\n/g, ' ').trim();
    return `["${cleanLabel}"]`;
  });

  // Fix unbalanced brackets
  const openBrackets = (sanitized.match(/\[/g) || []).length;
  const closeBrackets = (sanitized.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) {
    sanitized += ']'.repeat(openBrackets - closeBrackets);
  }

  // Standardize arrows
  sanitized = sanitized.replace(/\|>/g, '-->').replace(/~>/g, '-->');
  sanitized = sanitized.replace(/--+>/g, '-->').replace(/-\.-+>/g, '-.->');

  // Ensure first line is strictly a valid graph type
  const rawLines = sanitized.split('\n');
  const graphHeaderIndex = rawLines.findIndex(l => /^(graph|flowchart|sequenceDiagram|gantt)/i.test(l.trim()));
  if (graphHeaderIndex === -1) {
    sanitized = 'graph TD;\n' + sanitized;
  } else if (graphHeaderIndex > 0) {
    sanitized = rawLines.slice(graphHeaderIndex).join('\n');
  }

  return sanitized;
};

export const nuclearFallbackStrip = (code) => {
  if (!code) return '';
  const lines = code.split('\n');
  const styleLines = [];
  const diagramLines = [];
  const cleanLines = [];
  lines.forEach(line => {
    let trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('style ') ||
      trimmed.startsWith('classDef ') ||
      trimmed.startsWith('class ') ||
      trimmed.startsWith('click ') ||
      trimmed.startsWith('linkStyle ')) {
      return;
    }
    trimmed = trimmed.replace(/(-\.->|-->|-\.-+|--+)\s*\|[^|]+\|\s*/g, (match, arrow) => {
      return arrow + ' ';
    });
    cleanLines.push(trimmed);
  });
  return cleanLines.join('\n');
};

export const extractNodes = (code) => {
  if (!code) return [];
  const lines = code.split('\n');
  const nodes = [];
  const seenIds = new Set();

  const nodeRegex = /\b([a-zA-Z0-9_-]+)\s*(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\})/;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('style') || trimmed.startsWith('classDef') || trimmed.startsWith('click') || trimmed.startsWith('linkStyle')) return;

    const match = trimmed.match(nodeRegex);
    if (match) {
      const id = match[1];
      let label = match[2] || match[3] || match[4] || id;
      label = label.replace(/^"+|"+$/g, '').trim();

      if (!seenIds.has(id)) {
        seenIds.add(id);
        nodes.push({ id, label });
      }
    }
  });

  if (nodes.length === 0) {
    const words = code.match(/\b[a-zA-Z0-9_-]+\b/g) || [];
    words.forEach(w => {
      const upper = w.toUpperCase();
      if (upper !== 'GRAPH' && upper !== 'TD' && upper !== 'LR' && upper !== 'FLOWCHART' && !seenIds.has(w) && w.length > 1) {
        seenIds.add(w);
        nodes.push({ id: w, label: w });
      }
    });
  }

  return nodes;
};

export const MermaidDiagram = React.memo(({ chart, isExpanded = false }) => {
  const chartRef = useRef(null);
  const modalChartRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [diagramFallback, setDiagramFallback] = useState(false);
  const hasErrorRef = useRef(false);

  // Post-process SVG to force responsive sizing and eliminate 'Expected length, "auto"' errors
  const postProcessSvg = (svgString) => {
    if (!svgString) return '';
    let cleanedSvgString = svgString
      .replace(/height="auto"/gi, 'height="100%"')
      .replace(/height="([0-9.]+)pt"/gi, 'height="100%"')
      .replace(/height="([0-9.]+)px"/gi, 'height="100%"');

    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanedSvgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      if (svg.style) {
        svg.style.maxWidth = '100%';
        svg.style.height = '100%';
      }
      try {
        const styleEl = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleEl.textContent = `
          .node foreignObject { overflow: visible !important; }
          .node foreignObject div, .label foreignObject div {
            white-space: normal !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            text-align: center !important;
            font-size: 13px !important;
            line-height: 1.4 !important;
            padding: 4px 8px !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
        `;
        svg.insertBefore(styleEl, svg.firstChild);
      } catch (e) { }
    }
    return new XMLSerializer().serializeToString(doc);
  };

  useEffect(() => {
    hasErrorRef.current = false;
    setHasError(false);
    setDiagramFallback(false);
  }, [chart]);

  useEffect(() => {
    let isMounted = true;
    if (hasErrorRef.current) return;
    if (chartRef.current && chart && !isModalOpen) {
      const safeChart = sanitizeMermaid(chart);
      const id = `mermaid-mini-${Math.random().toString(36).substr(2, 9)}`;

      const renderChart = async () => {
        let finalChartToRender = safeChart;
        try {
          await mermaid.parse(safeChart);
        } catch (err) {
          console.warn("Mermaid parsing Attempt 1 failed, trying Attempt 2 (Nuclear Fallback):", err);
          try {
            const nuclearChart = nuclearFallbackStrip(safeChart);
            await mermaid.parse(nuclearChart);
            finalChartToRender = nuclearChart;
          } catch (err2) {
            console.error("Mermaid parsing Attempt 2 (Nuclear Fallback) failed:", err2);
            if (isMounted) {
              hasErrorRef.current = true;
              setHasError(true);
              setDiagramFallback(true);
            }
            const straySvg = document.getElementById(id);
            if (straySvg) straySvg.remove();
            document.querySelectorAll('.error-icon, .error-text, [id^="dmermaid"]').forEach(el => el.remove());
            return;
          }
        }

        try {
          // Ensure a temporary DOM element exists for mermaid.render
          let container = document.getElementById(id);
          if (!container) {
            container = document.createElement('div');
            container.id = id;
            container.style.display = 'none';
            document.body.appendChild(container);
          }

          const result = await mermaid.render(id, finalChartToRender);
          if (isMounted && chartRef.current && !hasErrorRef.current) {
            chartRef.current.innerHTML = postProcessSvg(result.svg);
          }
          if (container && container.parentNode) {
            container.parentNode.removeChild(container);
          }
        } catch (renderErr) {
          console.error("Mermaid rendering failed after successful parse:", renderErr);
          if (isMounted) {
            hasErrorRef.current = true;
            setHasError(true);
            setDiagramFallback(true);
          }
          const straySvg = document.getElementById(id);
          if (straySvg) straySvg.remove();
          document.querySelectorAll('.error-icon, .error-text, [id^="dmermaid"]').forEach(el => el.remove());
        }
      };

      renderChart();
    }
    return () => {
      isMounted = false;
      if (chartRef.current) {
        chartRef.current.innerHTML = '';
      }
    };
  }, [chart, isModalOpen]);

  useEffect(() => {
    let isMounted = true;
    if (hasErrorRef.current) return;
    if (isModalOpen && modalChartRef.current && chart) {
      const safeChart = sanitizeMermaid(chart);
      const id = `mermaid-modal-${Math.random().toString(36).substr(2, 9)}`;

      const renderChart = async () => {
        let finalChartToRender = safeChart;
        try {
          await mermaid.parse(safeChart);
        } catch (err) {
          console.warn("Mermaid modal parsing Attempt 1 failed, trying Attempt 2 (Nuclear Fallback):", err);
          try {
            const nuclearChart = nuclearFallbackStrip(safeChart);
            await mermaid.parse(nuclearChart);
            finalChartToRender = nuclearChart;
          } catch (err2) {
            console.error("Mermaid modal parsing Attempt 2 (Nuclear Fallback) failed:", err2);
            if (isMounted) {
              hasErrorRef.current = true;
              setHasError(true);
              setDiagramFallback(true);
            }
            const straySvg = document.getElementById(id);
            if (straySvg) straySvg.remove();
            document.querySelectorAll('.error-icon, .error-text, [id^="dmermaid"]').forEach(el => el.remove());
            return;
          }
        }

        try {
          const result = await mermaid.render(id, finalChartToRender);
          if (isMounted && modalChartRef.current && !hasErrorRef.current) {
            modalChartRef.current.innerHTML = postProcessSvg(result.svg);
          }
        } catch (renderErr) {
          console.error("Mermaid modal rendering failed after successful parse:", renderErr);
          if (isMounted) {
            hasErrorRef.current = true;
            setHasError(true);
            setDiagramFallback(true);
          }
          const straySvg = document.getElementById(id);
          if (straySvg) straySvg.remove();
          document.querySelectorAll('.error-icon, .error-text, [id^="dmermaid"]').forEach(el => el.remove());
        }
      };

      renderChart();
    }
    return () => {
      isMounted = false;
      if (modalChartRef.current) {
        modalChartRef.current.innerHTML = '';
      }
    };
  }, [chart, isModalOpen]);

  const handleDownload = async () => {
    if (!modalChartRef.current) return;

    const svgElement = modalChartRef.current.querySelector('svg');

    // Fallback: html2canvas with oklch computed style normalization
    const runHtml2CanvasFallback = async () => {
      try {
        const canvas = await html2canvas(modalChartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          onclone: (clonedDoc) => {
            const allNodes = clonedDoc.querySelectorAll('*');
            allNodes.forEach((node) => {
              const comp = clonedDoc.defaultView?.getComputedStyle(node);
              if (comp) {
                if (comp.color && comp.color.includes('oklch')) {
                  node.style.color = '#0f172a';
                }
                if (comp.backgroundColor && comp.backgroundColor.includes('oklch')) {
                  node.style.backgroundColor = '#ffffff';
                }
                if (comp.borderColor && comp.borderColor.includes('oklch')) {
                  node.style.borderColor = '#e2e8f0';
                }
              }
            });
          }
        });
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = "ScholarHub_Diagram.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (err) {
        console.error("html2canvas export failed:", err);
        toast.error("Failed to download diagram as PNG.");
      }
    };

    // Primary: DataURL Image proxy with white background fill (prevents cross-origin canvas taint & transparency issues)
    if (svgElement) {
      try {
        let svgString = new XMLSerializer().serializeToString(svgElement);
        if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
          svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

        const svgWidth = svgElement.viewBox?.baseVal?.width || svgElement.getBoundingClientRect().width || 800;
        const svgHeight = svgElement.viewBox?.baseVal?.height || svgElement.getBoundingClientRect().height || 600;

        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const scale = 2; // high-res rasterization
            canvas.width = Math.max(svgWidth, 400) * scale;
            canvas.height = Math.max(svgHeight, 300) * scale;

            const context = canvas.getContext('2d');
            if (context) {
              context.fillStyle = '#ffffff';
              context.fillRect(0, 0, canvas.width, canvas.height);
              context.drawImage(image, 0, 0, canvas.width, canvas.height);

              const pngUrl = canvas.toDataURL("image/png");
              const downloadLink = document.createElement("a");
              downloadLink.href = pngUrl;
              downloadLink.download = "ScholarHub_Diagram.png";
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
            } else {
              throw new Error("Could not get 2D context");
            }
          } catch (err) {
            console.error("Canvas draw failed, falling back to html2canvas:", err);
            runHtml2CanvasFallback();
          }
        };
        image.onerror = (err) => {
          console.error("DataURL image load failed, falling back to html2canvas:", err);
          runHtml2CanvasFallback();
        };
        image.src = dataUrl;
        return;
      } catch (err) {
        console.error("SVG serializing failed, falling back to html2canvas:", err);
      }
    }

    await runHtml2CanvasFallback();
  };

  if (isExpanded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent relative">
        <div
          ref={chartRef}
          style={{ color: '#0f172a' }}
          className={`w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:h-auto [&>svg]:w-auto [&>svg]:mx-auto ${hasError ? 'hidden' : ''}`}
        />
        {hasError && (
          diagramFallback && extractNodes(chart).length > 0 ? (
            <div className="w-full flex flex-col items-center gap-2 py-4 max-w-md mx-auto">
              {extractNodes(chart).map((node, index, arr) => (
                <React.Fragment key={node.id}>
                  <div className="w-full p-4 bg-white border border-slate-200/80 rounded-xl shadow-sm text-center">
                    <span className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Node {node.id}</span>
                    <span className="text-sm font-bold text-slate-700">{node.label}</span>
                  </div>
                  {index < arr.length - 1 && (
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 border border-slate-200/60 text-slate-500 shadow-sm text-xs font-black my-0.5 select-none">
                      ↓
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col gap-2 items-center justify-center text-slate-500 text-xs text-center p-4">
              <AlertCircle size={16} />
              <p>Complex Context: Visual Diagram Unavailable.</p>
            </div>
          )
        )}
      </div>
    );
  }

  return (
    <>
      <div
        ref={chartRef}
        style={{ color: '#0f172a' }}
        className={`w-full h-full flex justify-center items-center pointer-events-auto [&>svg]:w-full [&>svg]:max-w-full [&>svg]:h-auto ${hasError ? 'hidden' : ''}`}
      />
      {hasError && (
        diagramFallback && extractNodes(chart).length > 0 ? (
          <div className="w-full flex flex-col items-center gap-2 py-2 max-w-md mx-auto">
            {extractNodes(chart).map((node, index, arr) => (
              <React.Fragment key={node.id}>
                <div className="w-full p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs text-center">
                  <span className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Node {node.id}</span>
                  <span className="text-sm font-bold text-slate-700">{node.label}</span>
                </div>
                {index < arr.length - 1 && (
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 border border-slate-200/60 text-slate-500 shadow-xs text-xs font-black my-0.5 select-none">
                    ↓
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : null
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm md:p-4 animate-fadeIn">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full md:w-[95vw] md:h-[90vh] md:max-w-[95vw] md:rounded-2xl rounded-none bg-slate-50 border-0 md:border md:border-slate-200 flex flex-col shadow-2xl overflow-hidden relative"
            >
              {/* Header Row */}
              <div className="px-3 md:px-5 py-2.5 md:py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                <span className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-slate-700">
                  Diagram Canvas Viewer
                </span>
              </div>

              {/* Diagram Canvas */}
              <div className="flex-1 overflow-hidden bg-slate-50 relative">
                <TransformWrapper
                  initialScale={1}
                  minScale={0.1}
                  maxScale={8}
                  centerOnInit={true}
                  centerZoomedOut={true}
                  wheel={{ step: 0.02, smoothStep: 0.004 }}
                  panning={{ disabled: false, velocityDisabled: false }}
                  limitToBounds={false}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 md:gap-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl px-2 md:px-3 py-1.5 shadow-lg">
                        <button
                          onClick={() => zoomIn()}
                          className="p-1.5 md:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Zoom In"
                        >
                          <ZoomIn size={16} />
                        </button>
                        <button
                          onClick={() => zoomOut()}
                          className="p-1.5 md:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Zoom Out"
                        >
                          <ZoomOut size={16} />
                        </button>
                        <button
                          onClick={() => resetTransform()}
                          className="p-1.5 md:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Reset Zoom"
                        >
                          <Layout size={16} />
                        </button>
                        <div className="w-px h-5 bg-slate-200 mx-0.5" />
                        <button
                          onClick={handleDownload}
                          className="p-1.5 md:p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Download PNG"
                        >
                          <Download size={16} />
                          <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">PNG</span>
                        </button>
                        <div className="w-px h-5 bg-slate-200 mx-0.5" />
                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="p-1.5 md:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Close"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <TransformComponent
                        wrapperStyle={{ width: "100%", height: "100%" }}
                        contentStyle={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                        wrapperClass="cursor-grab active:cursor-grabbing"
                        contentClass="cursor-grab active:cursor-grabbing flex items-center justify-center min-w-full min-h-full"
                      >
                        <div ref={modalChartRef} style={{ color: '#0f172a', backgroundColor: '#ffffff' }} className={`w-full [&>svg]:w-full [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:cursor-grab [&>svg:active]:cursor-grabbing p-6 md:p-10 ${hasError ? 'hidden' : ''}`} />
                        {hasError && (
                          diagramFallback && extractNodes(chart).length > 0 ? (
                            <div className="w-full flex flex-col items-center gap-2 py-4 max-w-md mx-auto overflow-y-auto max-h-[70vh] px-4">
                              {extractNodes(chart).map((node, index, arr) => (
                                <React.Fragment key={node.id}>
                                  <div className="w-full p-4 bg-white border border-slate-200/80 rounded-xl shadow-sm text-center">
                                    <span className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Node {node.id}</span>
                                    <span className="text-sm font-bold text-slate-700">{node.label}</span>
                                  </div>
                                  {index < arr.length - 1 && (
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 border border-slate-200/60 text-slate-500 shadow-sm text-xs font-black my-0.5 select-none">
                                      ↓
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          ) : (
                            <div className="w-full h-full min-h-[300px] flex flex-col gap-2 items-center justify-center bg-slate-50 text-slate-500 text-[11px] leading-tight font-medium p-4 text-center max-w-lg mx-auto">
                              <AlertCircle size={14} className="text-slate-400" />
                              <p>Complex Context: Visual Diagram Unavailable.</p>
                            </div>
                          )
                        )}
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}, (prevProps, nextProps) => prevProps.chart === nextProps.chart);

export default MermaidDiagram;
