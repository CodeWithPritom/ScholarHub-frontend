import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { SLATE_THEME } from '../slateThemeToken';

/**
 * ECharts / Statistical Charts Adapter for UVE Ecosystem
 * Renders interactive Line, Bar, Pie, Scatter charts inside the UVE VisualDispatcher framework.
 */
export const EChartsAdapter = React.memo(({ type, config, onSourceClick }) => {
  const chartType = type || config?.type || 'bar';

  // Extract and sanitize ECharts option object
  const option = useMemo(() => {
    let rawOption = {};

    if (config?.series || config?.xAxis || config?.yAxis) {
      rawOption = JSON.parse(JSON.stringify(config));
    } else {
      const categories = config?.categories || ['Category 1', 'Category 2', 'Category 3'];
      const seriesData = config?.data || [40, 70, 95];
      rawOption = {
        xAxis: { type: 'category', data: categories },
        yAxis: { type: 'value' },
        series: [
          {
            data: seriesData,
            type: chartType === 'pie' ? 'pie' : 'bar',
            smooth: chartType === 'line',
            itemStyle: { borderRadius: [4, 4, 0, 0] }
          }
        ]
      };
    }

    // Clean raw markdown citation links in strings for tooltips and headers
    const cleanString = (str) => {
      if (typeof str !== 'string') return str;
      return str
        .replace(/\{c\[cite-(\d+)[^\]]*\]\([^\)]*\)\}/g, '[$1]')
        .replace(/\[cite-(\d+)[^\]]*\]\([^\)]*\)/g, '[$1]')
        .replace(/\[cite-(\d+)\]/g, '[$1]');
    };

    // Deep sanitize option strings
    const deepClean = (obj) => {
      if (!obj) return obj;
      if (typeof obj === 'string') return cleanString(obj);
      if (Array.isArray(obj)) return obj.map(deepClean);
      if (typeof obj === 'object') {
        const cleaned = {};
        for (const [k, v] of Object.entries(obj)) {
          cleaned[k] = deepClean(v);
        }
        return cleaned;
      }
      return obj;
    };

    const sanitizedOption = deepClean(rawOption);

    // Guarantee series normalization so ECharts NEVER receives a series item without a 'type'
    const defaultSeriesType = (chartType === 'bar' || chartType === 'line' || chartType === 'pie' || chartType === 'scatter' || chartType === 'radar') ? chartType : 'line';

    if (Array.isArray(sanitizedOption.series)) {
      sanitizedOption.series = sanitizedOption.series.map(s => {
        if (typeof s !== 'object' || !s) return { type: defaultSeriesType, data: s };
        return {
          type: s.type || defaultSeriesType,
          smooth: s.smooth !== undefined ? s.smooth : (defaultSeriesType === 'line'),
          symbolSize: s.symbolSize || 6,
          lineStyle: s.lineStyle || { width: 3 },
          ...s
        };
      });
    } else if (sanitizedOption.series && typeof sanitizedOption.series === 'object') {
      const s = sanitizedOption.series;
      sanitizedOption.series = [{
        type: s.type || defaultSeriesType,
        smooth: s.smooth !== undefined ? s.smooth : (defaultSeriesType === 'line'),
        symbolSize: s.symbolSize || 6,
        lineStyle: s.lineStyle || { width: 3 },
        ...s
      }];
    } else if (sanitizedOption.dataset && (!sanitizedOption.series || sanitizedOption.series.length === 0)) {
      sanitizedOption.series = [{ type: defaultSeriesType, smooth: true }];
    }

    // Ensure xAxis & yAxis types and bounds are set properly ONLY for cartesian charts
    const isCartesian = chartType === 'line' || chartType === 'bar' || chartType === 'scatter';
    if (isCartesian) {
      if (Array.isArray(sanitizedOption.xAxis)) {
        sanitizedOption.xAxis = sanitizedOption.xAxis.map(x => ({ type: 'category', ...x }));
      } else if (sanitizedOption.xAxis && typeof sanitizedOption.xAxis === 'object') {
        sanitizedOption.xAxis = { type: 'category', ...sanitizedOption.xAxis };
      }

      if (Array.isArray(sanitizedOption.yAxis)) {
        sanitizedOption.yAxis = sanitizedOption.yAxis.map(y => ({ type: 'value', ...y }));
      } else if (sanitizedOption.yAxis && typeof sanitizedOption.yAxis === 'object') {
        sanitizedOption.yAxis = { type: 'value', ...sanitizedOption.yAxis };
      }
    } else {
      // Remove axes if present to prevent crashes on Pie/Radar
      delete sanitizedOption.xAxis;
      delete sanitizedOption.yAxis;
    }

    const hasTitle = Boolean(sanitizedOption.title);
    const hasLegend = Boolean(sanitizedOption.legend);

    // Title positioning to avoid header overlap
    if (sanitizedOption.title) {
      if (typeof sanitizedOption.title === 'string') {
        sanitizedOption.title = { text: sanitizedOption.title };
      }
      sanitizedOption.title = {
        left: 'center',
        top: 6,
        textStyle: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', width: 420, overflow: 'truncate' },
        subtextStyle: { fontSize: 10, color: '#64748b', width: 420, overflow: 'truncate' },
        ...sanitizedOption.title
      };
    }

    // Legend positioning below title to prevent overlaps
    if (sanitizedOption.legend) {
      if (typeof sanitizedOption.legend === 'string') {
        sanitizedOption.legend = { data: [sanitizedOption.legend] };
      }
      sanitizedOption.legend = {
        top: hasTitle ? 36 : 8,
        left: 'center',
        textStyle: { fontSize: 11, color: '#475569' },
        itemGap: 12,
        ...sanitizedOption.legend
      };
    }

    // Calculate grid padding dynamically (guaranteeing 65px left for Y-axis labels)
    const gridTop = hasTitle && hasLegend ? 75 : (hasTitle || hasLegend ? 55 : 35);
    const gridBottom = 45;

    sanitizedOption.grid = {
      top: gridTop,
      left: 65,
      right: 35,
      bottom: gridBottom,
      containLabel: true,
      ...(sanitizedOption.grid || {})
    };

    // Determine if the chart uses Cartesian coordinates
    const hasAxis = chartType === 'line' || chartType === 'bar' || chartType === 'scatter';

    sanitizedOption.tooltip = {
      trigger: sanitizedOption.tooltip?.trigger || (hasAxis ? 'axis' : 'item'),
      axisPointer: hasAxis ? { type: 'shadow' } : undefined,
      backgroundColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#f8fafc', fontSize: 11 },
      extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.18); z-index: 50;',
      ...(sanitizedOption.tooltip || {})
    };

    sanitizedOption.color = sanitizedOption.color || SLATE_THEME.palette;

    return sanitizedOption;
  }, [config, chartType]);

  const onChartClick = (params) => {
    if (!onSourceClick) return;
    
    // Scan for paper indices [1], [2] in name, seriesName, or raw data
    const scanString = `${params.name || ''} ${params.seriesName || ''} ${JSON.stringify(params.data || {})}`;
    const matches = [...scanString.matchAll(/\[(\d+)\]/g)];
    
    if (matches.length > 0) {
      onSourceClick(matches[0][1]);
    }
  };

  const onEvents = {
    'click': onChartClick
  };

  return (
    <div className="w-full h-[380px] min-h-[380px] min-w-[300px] relative p-2 bg-white flex flex-col justify-center items-center overflow-hidden">
      <ReactECharts 
        option={option} 
        style={{ height: '380px', width: '100%', minHeight: '380px' }} 
        opts={{ width: 'auto', height: 380 }}
        onEvents={onEvents}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.type === nextProps.type && JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config);
});
export default EChartsAdapter;
