import React from 'react';
import { MermaidDiagram } from '../../MermaidDiagram';

/**
 * Mermaid Adapter for UVE Ecosystem
 * Renders process flows, sequence diagrams, ER diagrams, Gantt charts, state diagrams
 */
export const MermaidAdapter = React.memo(({ config, isExpanded = false }) => {
  let chartDefinition = '';
  if (typeof config === 'string') {
    chartDefinition = config;
  } else if (config?.definition || config?.chart) {
    chartDefinition = config.definition || config.chart;
  } else if (config?.nodes && Array.isArray(config.nodes) && config.nodes.length > 0) {
    const nodeMap = {};
    const lines = ['graph TD'];
    config.nodes.forEach((n, idx) => {
      const label = n.data?.label || n.label || n.id || `Node ${idx + 1}`;
      const cleanId = String(n.id || `node_${idx + 1}`).replace(/[^a-zA-Z0-9_]/g, '_');
      nodeMap[n.id || idx] = cleanId;
      lines.push(`  ${cleanId}["${label}"]`);
    });
    if (Array.isArray(config.edges)) {
      config.edges.forEach(e => {
        const src = nodeMap[e.source] || String(e.source || '').replace(/[^a-zA-Z0-9_]/g, '_');
        const tgt = nodeMap[e.target] || String(e.target || '').replace(/[^a-zA-Z0-9_]/g, '_');
        if (src && tgt) {
          lines.push(`  ${src} --> ${tgt}`);
        }
      });
    }
    chartDefinition = lines.join('\n');
  }

  if (!chartDefinition || typeof chartDefinition !== 'string' || !chartDefinition.trim()) {
    return null;
  }

  return <MermaidDiagram chart={chartDefinition} isExpanded={isExpanded} />;
});
