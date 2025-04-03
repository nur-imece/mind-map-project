import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';

import './index.scss';

// Import components
import Index from './components/customNode';
import CustomEdge from './components/custom-edge';
import MapHeader from './components/mapHeader';
import MapContainer from './components/map-container';
import ErrorView from './components/error-view';
import useMapDataProvider from './components/map-data-provider';

const mindMapPage = () => {
  const [searchParams] = useSearchParams();
  const mapId = searchParams.get('mapId');
  const navigate = useNavigate();
  const updateTriggerRef = useRef(0);
  const nodePositionChangeTimeoutRef = useRef(null);

  // Use the map data provider hook
  const {
    loading,
    error,
    mindMapData,
    saveInProgress,
    nodes: initialNodes,
    edges: initialEdges,
    saveMindMapChanges,
    handleNameChange,
    saveMapFnRef
  } = useMapDataProvider(mapId);
  
  // ReactFlow states for node and edge management 
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Update nodes and edges when initial data changes
  useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes, setNodes]);
  
  useEffect(() => {
    if (initialEdges && initialEdges.length > 0) {
      setEdges(initialEdges);
    }
  }, [initialEdges, setEdges]);

  // Özel nodes change handler - pozisyon değişikliklerinde kaydetme için
  const handleNodesChange = (changes) => {
    onNodesChange(changes);
    
    // Pozisyon değişikliği varsa, 1 saniye sonra otomatik kaydet
    const hasPositionChange = changes.some(change => change.type === 'position');
    if (hasPositionChange) {
      // Önceki timeout'u temizle
      if (nodePositionChangeTimeoutRef.current) {
        clearTimeout(nodePositionChangeTimeoutRef.current);
      }
      
      // Yeni timeout ayarla
      nodePositionChangeTimeoutRef.current = setTimeout(() => {
        saveChanges();
        nodePositionChangeTimeoutRef.current = null;
      }, 1000);
    }
  };

  // Type definitions for ReactFlow
  const nodeTypes = useMemo(() => ({
    customNode: Index
  }), []);

  // Edge type definitions
  const edgeTypes = useMemo(() => ({
    default: CustomEdge,
    straight: CustomEdge,
    bezier: CustomEdge,
    smoothstep: CustomEdge
  }), []);

  // Navigate back to list
  const handleBack = () => {
    navigate('/mind-map-list');
  };

  // Handle edge click to change style
  const handleEdgeClick = (event, edge) => {
    if (!edge?.id) return;
    
    const { getNextEdgeStyle } = require('./components/edge-utils');
    
    setEdges((eds) => {
      const updatedEdges = eds.map((e) => {
        if (e.id === edge.id) {
          // Save current edge color
          const currentColor = e.style.stroke;
          
          // Get next style
          const nextStyle = getNextEdgeStyle(e.type, {
            ...e.style,
            stroke: undefined 
          });
          
          // Create updated edge
          return {
            ...e,
            type: nextStyle.type,
            style: {
              ...nextStyle.style,
              stroke: currentColor
            },
            data: {
              ...e.data,
              styleName: nextStyle.name,
              styleDescription: nextStyle.description
            }
          };
        }
        return e;
      });
      
      // Update API
      if (mindMapData && nodes.length > 0 && saveMapFnRef.current) {
        setTimeout(() => {
          saveMapFnRef.current({
            nodes, 
            edges: updatedEdges,
            name: mindMapData.name
          });
        }, 100);
      }
      
      return updatedEdges;
    });
  };
  
  // Periodic save function to preserve changes
  const saveChanges = () => {
    if (mindMapData && nodes.length > 0 && !saveInProgress && saveMapFnRef.current) {
      updateTriggerRef.current += 1;
      saveMapFnRef.current({
        nodes,
        edges,
        name: mindMapData.name
      });
    }
  };

  // Show error if loading failed
  if (error && !loading) {
    return <ErrorView error={error} onBack={handleBack} />;
  }

  // Render the mind map
  return (
    <div className="mind-map-page">
      <Spin spinning={loading} tip="Harita yükleniyor..." style={{ minHeight: '400px' }}>
        {!loading && (
          <>
            <MapHeader 
              mapData={mindMapData} 
              onBack={handleBack} 
              onNameChange={handleNameChange}
              onSave={() => saveChanges()}
              saveInProgress={saveInProgress}
            />
            <MapContainer 
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              onEdgeClick={handleEdgeClick}
              onNodeClick={(e, node) => console.log('Node clicked:', node)}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
            />
          </>
        )}
      </Spin>
    </div>
  );
};

export default mindMapPage;
