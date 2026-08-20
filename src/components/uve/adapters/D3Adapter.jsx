import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SLATE_THEME } from '../slateThemeToken';

const formatNote = (note) => {
  if (note === null || note === undefined) return '';
  if (typeof note === 'object') {
    return note.text || note.label || note.value || note.annotation || JSON.stringify(note);
  }
  return String(note);
};

/**
 * Upgraded D3.js Force-Directed Citation & Network Adapter for UVE Ecosystem
 */
export const D3Adapter = React.memo(({ type, config }) => {
  const svgRef = useRef(null);
  const title = config?.title || 'Citation & Co-Citation Network Graph';
  const rawNodes = config?.nodes || [
    { id: '1', label: 'Primary Paper', group: 1, size: 24 },
    { id: '2', label: 'Cited Study A', group: 2, size: 16 },
    { id: '3', label: 'Cited Study B', group: 2, size: 16 },
    { id: '4', label: 'Co-cited Work C', group: 3, size: 18 },
    { id: '5', label: 'Co-cited Work D', group: 3, size: 14 },
  ];

  const rawLinks = config?.links || config?.edges || [
    { source: '1', target: '2', value: 2 },
    { source: '1', target: '3', value: 2 },
    { source: '2', target: '4', value: 1 },
    { source: '3', target: '4', value: 1 },
    { source: '1', target: '5', value: 1 },
  ];

  const annotations = config?.annotations || [];

  useEffect(() => {
    if (!svgRef.current || !rawNodes.length) return;

    const width = 650;
    const height = 320;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', [0, 0, width, height]);

    const nodesData = rawNodes.map((n) => ({
      ...n,
      label: formatNote(n.label || n.id),
    }));

    const linksData = rawLinks.map((l) => ({
      source: typeof l.source === 'object' ? l.source.id : String(l.source),
      target: typeof l.target === 'object' ? l.target.id : String(l.target),
      value: l.value || 1.5,
      dashed: l.dashed,
    }));

    const simulation = d3
      .forceSimulation(nodesData)
      .force(
        'link',
        d3.forceLink(linksData).id((d) => d.id).distance(90)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    const g = svg.append('g');

    svg
      .append('defs')
      .append('marker')
      .attr('id', 'd3-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#cbd5e1');

    const link = g
      .append('g')
      .selectAll('line')
      .data(linksData)
      .join('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', (d) => Math.max(1.5, d.value || 1.5))
      .attr('stroke-dasharray', (d) => (d.dashed ? '4,4' : 'none'))
      .attr('marker-end', 'url(#d3-arrow)');

    const colorScale = d3.scaleOrdinal(SLATE_THEME.palette);

    const drag = (sim) => {
      function dragstarted(event) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event) {
        if (!event.active) sim.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    };

    const node = g
      .append('g')
      .selectAll('g')
      .data(nodesData)
      .join('g')
      .call(drag(simulation))
      .style('cursor', 'grab');

    node
      .append('circle')
      .attr('r', (d) => d.size || 18)
      .attr('fill', (d) => colorScale(d.group || 1))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2.5)
      .attr('class', 'shadow-sm');

    node
      .append('text')
      .text((d) => d.label)
      .attr('x', 0)
      .attr('y', (d) => (d.size || 18) + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', SLATE_THEME.text.primary)
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('font-family', SLATE_THEME.fontFamily.sans);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [rawNodes, rawLinks]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white p-4 relative overflow-hidden rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-indigo-600 font-bold text-sm">🕸️ D3 Graph:</span>
          <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">{title}</h4>
        </div>
        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
          {rawNodes.length} Nodes Connected
        </span>
      </div>

      {/* D3 Simulation SVG Surface */}
      <div className="flex-1 w-full min-h-[270px] relative bg-slate-50/40 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
        <svg ref={svgRef} className="w-full h-full max-h-[340px]" />
      </div>

      {/* Annotations */}
      {annotations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            Network Topology
          </span>
          {annotations.map((note, i) => (
            <span key={i} className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {formatNote(note)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => prevProps.type === nextProps.type && JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config));

export default D3Adapter;
