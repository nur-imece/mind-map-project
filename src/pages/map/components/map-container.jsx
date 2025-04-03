import React from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import { Empty } from 'antd';
import 'reactflow/dist/style.css';
import './map-container.scss';

const mapContainer = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onEdgeClick, 
  onNodeClick, 
  nodeTypes, 
  edgeTypes 
}) => {
  return (
    <div className="mind-map-container">
      {nodes.length > 0 ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeClick={onEdgeClick}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          edgesUpdatable={true}
          edgesFocusable={true}
          selectNodesOnDrag={false}
          elementsSelectable={true}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap
            nodeStrokeColor={(n) => n.data?.bgColor || '#eee'}
            nodeColor={(n) => n.data?.bgColor || '#fff'}
            nodeBorderRadius={4}
          />
        </ReactFlow>
      ) : (
        <Empty description="Haritada görüntülenecek düğüm yok" />
      )}
    </div>
  );
};

export default mapContainer; 