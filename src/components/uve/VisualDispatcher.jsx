import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MermaidAdapter } from './adapters/MermaidAdapter';
import { EChartsAdapter } from './adapters/EChartsAdapter';
import { ReactFlowAdapter } from './adapters/ReactFlowAdapter';
import { D3Adapter } from './adapters/D3Adapter';
import { MarkdownAdapter } from './adapters/MarkdownAdapter';
import { VisualExpandModal } from './VisualExpandModal';
import { Maximize2, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Code, RefreshCw, ZoomIn, ZoomOut, Layout } from 'lucide-react';

class VisualizationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Visualization rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-3 bg-red-50/50 p-6 rounded-xl border border-red-100">
          <span className="text-2xl">⚠️</span>
          <span className="text-xs font-black uppercase tracking-widest text-red-500">Visualization Failed</span>
          <span className="text-[10px] text-red-400 max-w-xs font-semibold leading-relaxed text-center mb-2">
            The generated code for this visualization contained invalid syntax or structural errors.
          </span>
          <button 
            onClick={() => {
              this.setState({ hasError: false });
              if (this.props.onRetry) this.props.onRetry();
            }} 
            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold shadow-sm hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} /> Retry Visualization
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ArtifactFrame = ({ 
  icon, 
  title, 
  onShowSource, 
  onRefresh, 
  onExpand, 
  isTable,
  isReactFlow,
  isECharts,
  children 
}) => {
  return (
    <div className="w-full h-[420px] max-h-[420px] relative bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden group my-3 shadow-2xs">
      {/* Floating Top-Right Action Pill */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md border border-slate-200/90 p-1 rounded-full shadow-xs">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-2 flex items-center gap-1 select-none">
          {icon} <span className="hidden sm:inline">{title}</span>
        </span>
        {onShowSource && (
          <button onClick={onShowSource} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer" title="Show Source Code">
            <Code size={13} />
          </button>
        )}
        {onRefresh && (
          <button onClick={onRefresh} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer" title="Refresh">
            <RefreshCw size={13} />
          </button>
        )}
        {onExpand && (
          <button onClick={onExpand} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full transition-all flex items-center gap-1 px-2 cursor-pointer shadow-xs" title="Open in Canvas (Full Screen)">
            <Maximize2 size={12} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Canvas</span>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50 relative">
        {isTable ? (
          <div className="w-full h-full overflow-auto p-4 pt-12">
             {children}
          </div>
        ) : isReactFlow || isECharts ? (
          <div 
            className="w-full h-full min-h-[380px] p-2 pt-10 flex flex-col relative bg-white overflow-hidden"
            style={{ width: '100%', height: '100%', minHeight: 380 }}
          >
             {children}
          </div>
        ) : (
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            centerOnInit={true}
            wheel={{ disabled: true }}
            doubleClick={{ disabled: true }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {children}
                </TransformComponent>
                
                {/* Floating Control Panel */}
                <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md border border-slate-200/90 p-1 rounded-full shadow-sm">
                  <button onClick={() => zoomIn()} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer" title="Zoom In">
                    <ZoomIn size={13} />
                  </button>
                  <button onClick={() => zoomOut()} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer" title="Zoom Out">
                    <ZoomOut size={13} />
                  </button>
                  <div className="h-3.5 w-px bg-slate-200 mx-0.5" />
                  <button onClick={() => resetTransform()} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer" title="Reset Zoom">
                    <Layout size={13} />
                  </button>
                </div>
              </>
            )}
          </TransformWrapper>
        )}
      </div>
    </div>
  );
};

// Forgiving JSON Auto-Repair Helper
// Forgiving JSON Auto-Repair Helper
const repairIncompleteJson = (jsonStr) => {
  if (typeof jsonStr !== 'string') return null;
  let str = jsonStr.trim();

  // Strip backtick code block fences if present (e.g. ```uve-json ... ```)
  if (str.startsWith('```')) {
    str = str.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  // 1. Look for a candidate JSON object that contains key visualization markers ("engine", "nodes", "edges", "config")
  const vizEngineMatch = str.match(/\{\s*"(?:engine|visualization|config|nodes)"[\s\S]*?\}/);
  if (vizEngineMatch) {
    try {
      return JSON.parse(vizEngineMatch[0]);
    } catch (e) {}
  }

  // 2. Extract JSON substring starting at first '{' to last '}'
  const firstBrace = str.indexOf('{');
  if (firstBrace === -1) return null;

  const lastBrace = str.lastIndexOf('}');
  if (lastBrace > firstBrace) {
    const candidate = str.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {}
  }

  // Fallback: auto-close unclosed strings, brackets, and braces
  str = str.substring(firstBrace);
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (char === '\\') {
      isEscaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') openBraces++;
      else if (char === '}') openBraces = Math.max(0, openBraces - 1);
      else if (char === '[') openBrackets++;
      else if (char === ']') openBrackets = Math.max(0, openBrackets - 1);
    }
  }

  let repaired = str;
  if (inString) repaired += '"';
  while (openBrackets > 0) {
    repaired += ']';
    openBrackets--;
  }
  while (openBraces > 0) {
    repaired += '}';
    openBraces--;
  }

  try {
    return JSON.parse(repaired);
  } catch (err) {
    return null;
  }
};

/**
 * Universal Visualization Engine (UVE) — Visual Dispatcher
 * Inspects incoming structured JSON or raw text, aggressively parses Mermaid diagrams,
 * and dispatches to appropriate engine adapter with a unified artifact header.
 */
export const VisualDispatcher = React.memo(({ payload, rawJson, onSourceClick }) => {
  const targetPayload = payload || rawJson;

  const payloadStr = useMemo(() => {
    return typeof targetPayload === 'string' ? targetPayload : JSON.stringify(targetPayload);
  }, [targetPayload]);

  const prevPayloadStrRef = useRef(payloadStr);
  const isMountedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const containerRef = useRef(null);

  // Resilient & Aggressive Mermaid / UVE Parser with Auto-Repair
  const parsedPayload = useMemo(() => {
    if (!targetPayload) return null;
    if (typeof targetPayload === 'string') {
      let trimmed = targetPayload.trim();

      // Strip markdown code block wrappers if present
      if (trimmed.startsWith('```')) {
        trimmed = trimmed.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/\n?```$/, '').trim();
      }

      // Check if string contains raw Mermaid diagram syntax (even if concatenated after JSON)
      const mermaidMatch = trimmed.match(/(graph\s+(?:TD|LR|TB|RL)|flowchart\s+(?:TD|LR|TB|RL)|sequenceDiagram|gantt|classDiagram|stateDiagram-v2)[\s\S]+/i);
      
      const isRawMermaidOnly = (
        trimmed.startsWith('graph ') || 
        trimmed.startsWith('graph\n') ||
        trimmed.startsWith('flowchart ') || 
        trimmed.startsWith('flowchart\n') ||
        trimmed.startsWith('sequenceDiagram') || 
        trimmed.startsWith('gantt') || 
        trimmed.startsWith('classDiagram')
      );

      if (isRawMermaidOnly && !trimmed.startsWith('{')) {
        return {
          visualization: {
            engine: 'mermaid',
            config: trimmed
          }
        };
      }

      // Attempt JSON repair
      let repaired = repairIncompleteJson(trimmed);

      // If repaired is null but we found a embedded Mermaid graph syntax in the text payload
      if (!repaired && mermaidMatch) {
        return {
          visualization: {
            engine: 'mermaid',
            config: mermaidMatch[0].trim()
          }
        };
      }

      if (repaired) {
        const vizObj = repaired?.visualization || repaired;
        // If engine is mermaid and config contains nodes/edges object OR chart definition
        if (vizObj && (vizObj.engine === 'mermaid' || vizObj.engine === 'react-flow' || vizObj.engine === 'graph')) {
          // If there's an explicit raw Mermaid definition appended after the JSON block
          if (mermaidMatch) {
            vizObj.config = mermaidMatch[0].trim();
            vizObj.engine = 'mermaid';
          }
        }
        return repaired;
      }

      if (mermaidMatch) {
        return {
          visualization: {
            engine: 'mermaid',
            config: mermaidMatch[0].trim()
          }
        };
      }
      return null;
    }
    return targetPayload;
  }, [targetPayload, renderKey]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      prevPayloadStrRef.current = payloadStr;
    } else if (prevPayloadStrRef.current !== payloadStr) {
      prevPayloadStrRef.current = payloadStr;
    }
  }, [payloadStr]);

  const viz = parsedPayload?.visualization || parsedPayload;
  const engine = (viz?.engine || '').toLowerCase();
  const type = (viz?.type || '').toLowerCase();
  const config = viz?.config || viz;

  // Filter out invalid phantom blocks (e.g. JSON with only theme/style and no nodes/edges/engine)
  const isPhantomThemeBlock = !engine && !type && !viz?.nodes && !viz?.edges && !config?.nodes && !config?.edges && (viz?.theme || viz?.style || typeof viz !== 'object');
  if (isPhantomThemeBlock || !parsedPayload) {
    return null;
  }

  const isTable = engine === 'markdown' || engine === 'table';

  const headerInfo = useMemo(() => {
    switch (engine) {
      case 'mermaid':
        return { icon: '📊', shortLabel: 'Flow Diagram', engineName: 'Mermaid' };
      case 'echarts':
      case 'chart':
        return { icon: '📈', shortLabel: 'Data Chart', engineName: 'ECharts' };
      case 'react-flow':
      case 'mindmap':
        return { icon: '🧠', shortLabel: 'Mind-Map', engineName: 'React Flow' };
      case 'd3':
      case 'graph':
      case 'network':
        return { icon: '🕸️', shortLabel: 'Network Graph', engineName: 'D3.js' };
      case 'markdown':
      case 'table':
        return { icon: '📋', shortLabel: 'Summary Table', engineName: 'Table' };
      default:
        return { icon: '🔍', shortLabel: 'Visual Analysis', engineName: engine || 'Visual' };
    }
  }, [engine]);

  const handleCopyData = () => {
    try {
      let copyText = '';
      if (typeof config === 'string') {
        copyText = config;
      } else {
        copyText = JSON.stringify(config, null, 2);
      }
      navigator.clipboard.writeText(copyText);
      toast.success('Copied visualization data to clipboard!');
    } catch (e) {
      toast.error('Failed to copy data.');
    }
  };



  const renderContent = (expanded = false) => {
    switch (engine) {
      case 'mermaid':
        return <MermaidAdapter config={config} isExpanded={expanded} />;
      case 'echarts':
      case 'chart':
        return <EChartsAdapter type={type} config={config} onSourceClick={onSourceClick} isExpanded={expanded} />;
      case 'react-flow':
      case 'mindmap':
      case 'knowledge_graph':
        return <ReactFlowAdapter type={type} config={config} onSourceClick={onSourceClick} isExpanded={expanded} />;
      case 'd3':
      case 'graph':
      case 'network':
        return <D3Adapter type={type} config={config} isExpanded={expanded} />;
      case 'markdown':
      case 'table':
        return <MarkdownAdapter config={config} isExpanded={expanded} />;
      default:
        if (typeof config === 'string') {
          return <MermaidAdapter config={config} isExpanded={expanded} />;
        }
        return <EChartsAdapter type={type} config={config} onSourceClick={onSourceClick} isExpanded={expanded} />;
    }
  };

  const sharedContent = useMemo(() => {
    if (!parsedPayload) return null;
    return renderContent(isExpanded);
  }, [parsedPayload, engine, type, config, onSourceClick, isExpanded]);

  const isStreamingPartialJson = useMemo(() => {
    if (parsedPayload) return false;
    if (typeof payload === 'string') {
      const trimmed = payload.trim();
      const firstBrace = trimmed.indexOf('{');
      if (firstBrace === -1) return false;
      // Only treat as streaming if the payload string is very short (< 25 chars) and hasn't closed yet
      return trimmed.length < 25;
    }
    return false;
  }, [payload, parsedPayload]);

  if (isStreamingPartialJson || isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] aspect-video max-h-[550px] bg-slate-50/80 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center gap-3 p-6 text-center my-3 shadow-2xs">
        <div className="w-9 h-9 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-slate-700 animate-pulse">
          Processing Data Architecture...
        </span>
        <span className="text-[11px] font-medium text-slate-400 max-w-xs">
          Synthesizing nodes, edges, and domain metadata from literature sources.
        </span>
      </div>
    );
  }

  if (!parsedPayload) {
    return (
      <div className="w-full h-full min-h-[400px] aspect-video max-h-[550px] bg-slate-50/50 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center gap-3 text-slate-400 p-6 text-center my-3">
        <span className="text-2xl">⚠️</span>
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Visualization Context too complex</span>
        <span className="text-[10px] text-slate-400 max-w-xs font-semibold leading-relaxed">
          The dataset or query complexity exceeds current visualization matrix limits. Please try a simpler comparative prompt.
        </span>
        <button
          onClick={() => {
            setIsLoading(true);
            setRenderKey(k => k + 1);
            setTimeout(() => setIsLoading(false), 400);
          }}
          className="mt-2 px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-extrabold shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={13} className="text-slate-500" />
          <span>🔄 Force Re-render</span>
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[450px] bg-slate-50/80 animate-pulse rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-slate-500 animate-spin" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Visualization...</span>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="w-full my-2">
        <ArtifactFrame 
          icon={headerInfo.icon}
          title={headerInfo.shortLabel}
          onShowSource={() => handleCopyData()}
          onRefresh={() => {
            setIsLoading(true);
            setRenderKey(k => k + 1);
            setTimeout(() => setIsLoading(false), 400);
          }}
          onExpand={() => setIsExpanded(true)}
          isTable={isTable}
          isReactFlow={engine === 'react-flow' || engine === 'mindmap'}
          isECharts={engine === 'echarts' || engine === 'chart'}
        >
          <VisualizationErrorBoundary key={renderKey} onRetry={() => setRenderKey(k => k + 1)}>
            {sharedContent}
          </VisualizationErrorBoundary>
        </ArtifactFrame>
      </div>

      <VisualExpandModal 
        isOpen={isExpanded} 
        onClose={() => setIsExpanded(false)} 
        isTable={isTable}
        onShowSource={() => handleCopyData()}
        onCopyData={() => handleCopyData()}
      >
        {sharedContent}
      </VisualExpandModal>
    </>
  );
}, (prevProps, nextProps) => {
  if (prevProps.rawJson === nextProps.rawJson && prevProps.payload === nextProps.payload) {
    return true;
  }
  if (typeof prevProps.payload === 'string' && typeof nextProps.payload === 'string') {
    return prevProps.payload === nextProps.payload;
  }
  if (typeof prevProps.rawJson === 'string' && typeof nextProps.rawJson === 'string') {
    return prevProps.rawJson === nextProps.rawJson;
  }
  return prevProps.id === nextProps.id && prevProps.sessionKey === nextProps.sessionKey;
});

export default VisualDispatcher;
