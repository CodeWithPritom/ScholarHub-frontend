import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { SLATE_THEME } from '../slateThemeToken';

const formatNote = (note) => {
  if (note === null || note === undefined) return '';
  if (typeof note === 'object') {
    return note.text || note.label || note.value || note.annotation || JSON.stringify(note);
  }
  return String(note);
};

/**
 * Mathematical Function Plotter & Equation Renderer for UVE Ecosystem
 */
export const MathPlotAdapter = React.memo(({ type, config }) => {
  const title = config?.title || 'Mathematical Function Plot';
  const rawEq = config?.equation_latex || config?.equation || '';
  const latexEq = typeof rawEq === 'object' ? (rawEq.text || rawEq.latex || JSON.stringify(rawEq)) : String(rawEq);
  const xLabel = config?.x_label || 'x';
  const yLabel = config?.y_label || 'f(x)';
  const rawPoints = config?.data_points || [];
  const annotations = config?.annotations || [];

  // Filter and sanitize data points
  const dataPoints = useMemo(() => {
    if (!Array.isArray(rawPoints)) return [];
    return rawPoints
      .map((pt) => {
        if (!Array.isArray(pt) || pt.length < 2) return null;
        const px = parseFloat(pt[0]);
        const py = parseFloat(pt[1]);
        if (isNaN(px) || isNaN(py)) return null;
        return [px, py];
      })
      .filter(Boolean);
  }, [rawPoints]);

  // Render LaTeX equation to HTML via KaTeX
  const latexHtml = useMemo(() => {
    if (!latexEq) return '';
    try {
      return katex.renderToString(latexEq, { throwOnError: false });
    } catch (e) {
      return latexEq;
    }
  }, [latexEq]);

  // ECharts Plot Configuration
  const option = useMemo(() => {
    const theme = SLATE_THEME.math;

    return {
      grid: {
        top: 25,
        right: 30,
        bottom: 35,
        left: 45,
        containLabel: false,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          if (!params || !params[0]) return '';
          const p = params[0];
          return `<b>${xLabel}</b>: ${p.data[0]}<br/><b>${yLabel}</b>: ${typeof p.data[1] === 'number' ? p.data[1].toFixed(4) : p.data[1]}`;
        },
        backgroundColor: '#ffffff',
        borderColor: SLATE_THEME.background.border,
        textStyle: { color: SLATE_THEME.text.primary, fontSize: 11 },
      },
      xAxis: {
        type: 'value',
        name: xLabel,
        nameLocation: 'middle',
        nameGap: 22,
        axisLine: { lineStyle: { color: theme.axis, width: 2 } },
        splitLine: { lineStyle: { color: theme.grid, type: 'dashed' } },
        axisLabel: { color: SLATE_THEME.text.muted, fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        name: yLabel,
        nameLocation: 'middle',
        nameGap: 30,
        axisLine: { lineStyle: { color: theme.axis, width: 2 } },
        splitLine: { lineStyle: { color: theme.grid, type: 'dashed' } },
        axisLabel: { color: SLATE_THEME.text.muted, fontSize: 10 },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: dataPoints,
          lineStyle: { color: theme.curve, width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(99, 102, 241, 0.25)' },
                { offset: 1, color: 'rgba(99, 102, 241, 0.01)' },
              ],
            },
          },
        },
      ],
    };
  }, [dataPoints, xLabel, yLabel]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white p-4 relative overflow-hidden rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-indigo-600 font-bold text-sm">📐 Math Plot:</span>
          <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">{title}</h4>
        </div>
        {latexHtml && (
          <div
            className="bg-indigo-50/70 border border-indigo-100 px-3 py-1 rounded-lg text-indigo-950 font-serif text-xs shadow-2xs"
            dangerouslySetInnerHTML={{ __html: latexHtml }}
          />
        )}
      </div>

      {/* Interactive ECharts Surface */}
      <div className="flex-1 w-full min-h-[260px] relative bg-slate-50/30 rounded-xl border border-slate-100 p-2">
        {dataPoints.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <span className="text-2xl mb-1">📐</span>
            <span className="text-xs font-bold text-slate-500 uppercase">Plot Data Empty</span>
            <span className="text-[10px] text-slate-400 mt-0.5">SymPy pre-calculation active. Data points generating...</span>
          </div>
        ) : (
          <ReactECharts option={option} style={{ width: '100%', height: '100%', minHeight: 260 }} opts={{ renderer: 'canvas' }} />
        )}
      </div>

      {/* Mathematical Properties / Key Notes */}
      {annotations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            Mathematical Properties
          </span>
          {annotations.map((note, i) => (
            <span key={i} className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
              {formatNote(note)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => prevProps.type === nextProps.type && JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config));

export default MathPlotAdapter;
