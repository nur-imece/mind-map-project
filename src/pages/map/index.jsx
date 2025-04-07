import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, Empty } from 'antd';
import { useNodesState, useEdgesState, Background, Controls, MiniMap, ReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import { useTranslation } from 'react-i18next';

import './index.scss';

// Import components
import Index from './components/customNode';
import CustomEdge from './components/custom-edge';
import MapHeader from './components/mapHeader';
import MapContainer from './components/map-container';
import ErrorView from './components/error-view';
import BackgroundChanger from './components/backgroundChanger';
import useMapDataProvider from './components/map-data-provider';
import Header from "../../components/header";
// Import edge utils for edge styles
import { getNextEdgeStyle } from './components/edge-utils';

const mindMapPage = () => {
  const [searchParams] = useSearchParams();
  const mapId = searchParams.get('mapId');
  const navigate = useNavigate();
  const updateTriggerRef = useRef(0);
  const nodePositionChangeTimeoutRef = useRef(null);
  const { t } = useTranslation();

  // Use the map data provider hook
  const {
    loading,
    error,
    mindMapData,
    saveInProgress,
    nodes: initialNodes,
    edges: initialEdges,
    backgroundName,
    saveMindMapChanges,
    handleNameChange,
    handleBackgroundChange,
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
    
    // Detect position changes for saving
    const hasPositionChange = changes.some(change => 
      change.type === 'position' && (change.position?.x !== undefined || change.position?.y !== undefined)
    );
    
    if (hasPositionChange) {
      // Clear previous timeout to prevent multiple calls
      if (nodePositionChangeTimeoutRef.current) {
        clearTimeout(nodePositionChangeTimeoutRef.current);
      }
      
      // Debounce position changes
      nodePositionChangeTimeoutRef.current = setTimeout(() => {
        if (mindMapData && !saveInProgress && saveMapFnRef.current) {
          // Trigger a save with latest node positions
          saveMapFnRef.current({ 
            nodes, 
            edges,
            name: mindMapData.name,
            backgroundName
          });
        }
      }, 500); // 500ms debounce
    }
  };

  // Type definitions for ReactFlow
  const nodeTypes = useMemo(() => ({
    customNode: (props) => <Index {...props} saveMapFnRef={saveMapFnRef} />
  }), [saveMapFnRef]);

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
            name: mindMapData.name,
            backgroundName
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
        name: mindMapData.name,
        backgroundName
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
            <div className="mind-map-content">
              <BackgroundChanger 
                onBackgroundChange={handleBackgroundChange}
                initialBackgroundName={backgroundName}
              />
              <div className="react-flow-wrapper">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={handleNodesChange}
                  onEdgesChange={onEdgesChange}
                  onEdgeClick={handleEdgeClick}
                  onNodeClick={(e, node) => console.log('Node clicked:', node)}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  proOptions={{ hideAttribution: true }}
                  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                  minZoom={0.1}
                  maxZoom={2}
                  translateExtent={[[-5000, -5000], [5000, 5000]]}
                >
                  <Controls />
                  <MiniMap
                    nodeStrokeColor={(n) => n.data?.color || '#eee'}
                    nodeColor={(n) => n.data?.bgColor || '#fff'}
                    nodeBorderRadius={4}
                  />
                </ReactFlow>
              </div>
            </div>
          </>
        )}
      </Spin>
    </div>
  );
};

export default mindMapPage;
