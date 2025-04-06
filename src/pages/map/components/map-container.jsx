import React from 'react';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import './map-container.scss';

const mapContainer = ({ children }) => {
  return (
    <div className="map-container">
      <ReactFlow
        proOptions={{ hideAttribution: true }}
      >
        {children}
      </ReactFlow>
    </div>
  );
};

export default mapContainer; 