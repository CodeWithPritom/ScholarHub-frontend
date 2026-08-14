/**
 * Universal Visualization Engine (UVE) — Enterprise Slate Theme Engine
 * Provides unified color tokens, fonts, and styling contracts across
 * Mermaid, Apache ECharts, React Flow, D3.js, and Markdown tables.
 */

export const SLATE_THEME = {
  background: {
    primary: '#ffffff',
    surface: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    overlay: 'rgba(15, 23, 42, 0.8)',
  },
  text: {
    primary: '#0f172a',
    secondary: '#334155',
    muted: '#64748b',
    light: '#94a3b8',
  },
  accent: {
    blue: { fill: '#dbeafe', stroke: '#1d4ed8', text: '#1e40af', hex: '#3b82f6' },
    indigo: { fill: '#e0e7ff', stroke: '#4338ca', text: '#3730a3', hex: '#6366f1' },
    emerald: { fill: '#dcfce7', stroke: '#15803d', text: '#166534', hex: '#10b981' },
    amber: { fill: '#fef3c7', stroke: '#b45309', text: '#92400e', hex: '#f59e0b' },
    purple: { fill: '#f3e8ff', stroke: '#7e22ce', text: '#6b21a8', hex: '#8b5cf6' },
    rose: { fill: '#ffe4e6', stroke: '#be123c', text: '#9f1239', hex: '#f43f5e' },
  },
  palette: ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#0ea5e9', '#14b8a6'],
  fontFamily: {
    sans: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Merriweather, Georgia, Cambria, serif",
    mono: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
};

/**
 * Generates an Apache ECharts theme object matching the Slate Design System
 */
export const getEChartsSlateTheme = () => ({
  color: SLATE_THEME.palette,
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: SLATE_THEME.fontFamily.sans,
    color: SLATE_THEME.text.secondary,
  },
  title: {
    textStyle: {
      color: SLATE_THEME.text.primary,
      fontWeight: 700,
    },
    subtextStyle: {
      color: SLATE_THEME.text.muted,
    },
  },
  line: {
    itemStyle: { borderWidth: 2 },
    lineStyle: { width: 3 },
    symbolSize: 6,
    symbol: 'circle',
    smooth: true,
  },
  bar: {
    itemStyle: {
      borderRadius: [6, 6, 0, 0],
    },
  },
  categoryAxis: {
    axisLine: { show: true, lineStyle: { color: SLATE_THEME.background.border } },
    axisTick: { show: false },
    axisLabel: { color: SLATE_THEME.text.muted, fontSize: 11 },
    splitLine: { show: false },
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: SLATE_THEME.text.muted, fontSize: 11 },
    splitLine: { show: true, lineStyle: { color: '#f1f5f9', type: 'dashed' } },
  },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: SLATE_THEME.background.border,
    borderWidth: 1,
    padding: [10, 14],
    textStyle: { color: SLATE_THEME.text.primary, fontSize: 12 },
    extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); border-radius: 12px;',
  },
});
