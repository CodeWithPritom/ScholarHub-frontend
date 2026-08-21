import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
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

    // Sanitize visualMap to prevent legacy 'visualMap.color' uncaught errors
    if (sanitizedOption.visualMap && typeof sanitizedOption.visualMap === 'object') {
      if (Array.isArray(sanitizedOption.visualMap)) {
        sanitizedOption.visualMap = sanitizedOption.visualMap.map(vm => {
          if (vm && vm.color && !vm.inRange) {
            const { color, ...rest } = vm;
            return { ...rest, inRange: { color } };
          }
          return vm;
        });
      } else if (sanitizedOption.visualMap.color && !sanitizedOption.visualMap.inRange) {
        const { color, ...rest } = sanitizedOption.visualMap;
        sanitizedOption.visualMap = { ...rest, inRange: { color } };
      }
    }

    const VALID_ECHARTS_TYPES = new Set(['line', 'bar', 'pie', 'scatter', 'radar']);
    const normalizeSeriesType = (t) => {
      const clean = (t || '').toLowerCase().trim();
      if (clean === 'surface' || clean === '3d' || clean === 'mesh' || clean === 'area') return 'line';
      if (clean === 'histogram' || clean === 'column') return 'bar';
      if (VALID_ECHARTS_TYPES.has(clean)) return clean;
      return 'line';
    };

    // Guarantee series normalization so ECharts NEVER receives a series item without a valid 'type'
    const defaultSeriesType = normalizeSeriesType(chartType);

    // Extract legend names if provided
    let legendNames = [];
    if (sanitizedOption.legend?.data && Array.isArray(sanitizedOption.legend.data)) {
      legendNames = sanitizedOption.legend.data.map(d => typeof d === 'string' ? d : d?.name).filter(Boolean);
    } else if (typeof sanitizedOption.legend === 'string') {
      legendNames = [sanitizedOption.legend];
    }

    if (Array.isArray(sanitizedOption.series)) {
      sanitizedOption.series = sanitizedOption.series.map((s, idx) => {
        if (typeof s !== 'object' || !s) return { type: defaultSeriesType, data: s, name: legendNames[idx] || `Series ${idx + 1}` };
        const sType = normalizeSeriesType(s.type || defaultSeriesType);
        return {
          type: sType,
          name: s.name || legendNames[idx] || (sanitizedOption.series.length > 1 ? `Series ${idx + 1}` : undefined),
          smooth: s.smooth !== undefined ? s.smooth : (sType === 'line'),
          symbolSize: s.symbolSize || 6,
          lineStyle: s.lineStyle || { width: 3 },
          ...s
        };
      });
    } else if (sanitizedOption.series && typeof sanitizedOption.series === 'object') {
      const s = sanitizedOption.series;
      const sType = normalizeSeriesType(s.type || defaultSeriesType);
      sanitizedOption.series = [{
        type: sType,
        name: s.name || legendNames[0] || undefined,
        smooth: s.smooth !== undefined ? s.smooth : (sType === 'line'),
        symbolSize: s.symbolSize || 6,
        lineStyle: s.lineStyle || { width: 3 },
        ...s
      }];
    } else if (sanitizedOption.dataset && (!sanitizedOption.series || sanitizedOption.series.length === 0)) {
      sanitizedOption.series = [{ type: defaultSeriesType, smooth: true }];
    }

    // Synchronize legend.data with series names to prevent 'series not exists' warning
    if (Array.isArray(sanitizedOption.series) && sanitizedOption.series.length > 0) {
      const seriesNames = sanitizedOption.series.map(s => s.name).filter(Boolean);
      if (seriesNames.length > 0) {
        sanitizedOption.legend = {
          left: 'center',
          textStyle: { fontSize: 11, color: '#475569' },
          itemGap: 12,
          ...sanitizedOption.legend,
          data: seriesNames
        };
      }
    }

    // Ensure xAxis & yAxis types and bounds are set properly for ANY cartesian series
    const seriesList = Array.isArray(sanitizedOption.series) ? sanitizedOption.series : [];
    const seriesTypes = seriesList.map(s => (s?.type || defaultSeriesType).toLowerCase());
    const isCartesian = seriesTypes.some(t => t === 'line' || t === 'bar' || t === 'scatter' || t === 'candlestick' || t === 'heatmap' || t === 'boxplot') || (seriesTypes.length === 0 && defaultSeriesType !== 'pie' && defaultSeriesType !== 'radar');

    if (isCartesian) {
      if (!sanitizedOption.xAxis) {
        const categories = config?.categories || config?.xAxis?.data || ['Metric A', 'Metric B', 'Metric C', 'Metric D'];
        sanitizedOption.xAxis = { type: 'category', data: categories };
      } else if (Array.isArray(sanitizedOption.xAxis)) {
        sanitizedOption.xAxis = sanitizedOption.xAxis.map(x => ({ type: 'category', ...x }));
      } else if (sanitizedOption.xAxis && typeof sanitizedOption.xAxis === 'object') {
        sanitizedOption.xAxis = { type: 'category', ...sanitizedOption.xAxis };
      }

      if (!sanitizedOption.yAxis) {
        sanitizedOption.yAxis = { type: 'value' };
      } else if (Array.isArray(sanitizedOption.yAxis)) {
        sanitizedOption.yAxis = sanitizedOption.yAxis.map(y => ({ type: 'value', ...y }));
      } else if (sanitizedOption.yAxis && typeof sanitizedOption.yAxis === 'object') {
        sanitizedOption.yAxis = { type: 'value', ...sanitizedOption.yAxis };
      }
    } else {
      // Remove axes if purely non-cartesian (Pie/Radar)
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
      sanitizedOption.legend = {
        top: hasTitle ? 36 : 8,
        left: 'center',
        textStyle: { fontSize: 11, color: '#475569' },
        itemGap: 12,
        ...sanitizedOption.legend
      };
    }

    // Calculate grid padding dynamically with mobile-friendly spacing
    const gridTop = hasTitle && hasLegend ? 70 : (hasTitle || hasLegend ? 50 : 30);
    const gridBottom = 35;

    sanitizedOption.grid = {
      top: gridTop,
      left: 10,
      right: 15,
      bottom: gridBottom,
      containLabel: true,
      ...(sanitizedOption.grid || {})
    };

    // Responsive X-axis formatting for mobile
    if (sanitizedOption.xAxis) {
      const formatAxis = (ax) => ({
        ...ax,
        axisLabel: {
          fontSize: 10,
          color: '#64748b',
          interval: 0,
          hideOverlap: true,
          overflow: 'truncate',
          width: 70,
          ...(ax?.axisLabel || {})
        }
      });

      if (Array.isArray(sanitizedOption.xAxis)) {
        sanitizedOption.xAxis = sanitizedOption.xAxis.map(formatAxis);
      } else {
        sanitizedOption.xAxis = formatAxis(sanitizedOption.xAxis);
      }
    }

    // Determine if the chart uses Cartesian coordinates
    const hasAxis = isCartesian;

    sanitizedOption.tooltip = {
      trigger: sanitizedOption.tooltip?.trigger || (hasAxis ? 'axis' : 'item'),
      axisPointer: hasAxis ? { type: 'shadow' } : undefined,
      backgroundColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#f8fafc', fontSize: 11 },
      extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.18); z-index: 50; max-width: 280px;',
      confine: true,
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
    <div className="w-full h-full min-h-[260px] sm:min-h-[320px] md:min-h-[380px] relative p-1 sm:p-2 bg-white flex flex-col justify-center items-center overflow-hidden">
      <ReactECharts 
        echarts={echarts}
        option={option} 
        style={{ height: '100%', width: '100%', minHeight: '260px' }} 
        opts={{ renderer: 'svg' }}
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
