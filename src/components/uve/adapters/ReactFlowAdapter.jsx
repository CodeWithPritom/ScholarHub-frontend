import React, { useMemo, useCallback } from 'react';
import { ReactFlow, Background, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

/**
 * React Flow / Mind Map Adapter for UVE Ecosystem
 * Renders interactive node-based research maps and knowledge graphs inside the UVE framework.
 */
export const ReactFlowAdapter = React.memo(({ type, config, onSourceClick }) => {
  const nodesHash = JSON.stringify(config?.nodes || []);
  const edgesHash = JSON.stringify(config?.edges || []);

  // Provide structured hierarchical layout if nodes lack positions
  const formattedNodes = useMemo(() => {
    const rawNodes = config?.nodes || [];
    const total = rawNodes.length;
    const cols = total <= 3 ? total : Math.ceil(Math.sqrt(total));

    return rawNodes.map((node, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const defaultX = col * 260 + 40;
      const defaultY = row * 140 + 40;

      return {
        ...node,
        id: node.id || `node-${i}`,
        position: node.position || { x: defaultX, y: defaultY },
        data: { ...node.data, label: node.data?.label || node.label },
        style: {
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          padding: '12px 18px',
          fontSize: '12px',
          fontWeight: '700',
          color: '#0f172a',
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
          maxWidth: '220px',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          ...node.style
        }
      };
    });
  }, [nodesHash]);

  // Task 4 Guard: Filter out dangling edges to eliminate 'Node not found' console errors
  const formattedEdges = useMemo(() => {
    const rawEdges = config?.edges || [];
    const validNodeIds = new Set(formattedNodes.map(n => n.id));
    return rawEdges
      .filter(edge => edge && validNodeIds.has(edge.source) && validNodeIds.has(edge.target))
      .map((edge, i) => ({
        ...edge,
        id: edge.id || `edge-${i}`,
        type: edge.type || 'smoothstep',
        animated: edge.animated !== undefined ? edge.animated : true,
        style: { stroke: '#94a3b8', strokeWidth: 1.5, ...edge.style }
      }));
  }, [edgesHash, formattedNodes]);

  const [nodes, setNodes] = React.useState(formattedNodes);
  const [edges, setEdges] = React.useState(formattedEdges);

  React.useEffect(() => {
    setNodes(formattedNodes);
  }, [nodesHash]);

  React.useEffect(() => {
    setEdges(formattedEdges);
  }, [edgesHash]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleNodeClick = (event, node) => {
    if (!onSourceClick) return;

    // Extract citation numbers like [1], [2] from the label
    const label = node.data?.label || '';
    const matches = [...label.matchAll(/\[(\d+)\]/g)];

    if (matches.length > 0) {
      const paperIndex = matches[0][1];
      onSourceClick(paperIndex);
    }
  };

  if (!nodes || nodes.length === 0) {
    return (
      <div 
        className="w-full h-full min-h-[380px] flex items-center justify-center bg-slate-50/80 rounded-xl text-slate-400 text-xs font-bold font-sans"
        style={{ width: '100%', height: '100%', minHeight: 380 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Structuring Knowledge Map...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 w-full h-full min-h-[380px] relative bg-white"
      style={{ width: '100%', height: '100%', minHeight: 380 }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        minZoom={0.2}
        maxZoom={4}
        proOptions={{ hideAttribution: true }}
        style={{ width: '100%', height: '100%', minHeight: 380 }}
      >
        <Background color="#cbd5e1" gap={16} />
      </ReactFlow>
    </div>
  );
}, (prevProps, nextProps) => prevProps.type === nextProps.type && JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config));
export default ReactFlowAdapter;
