import useCollaborationStore from '../collaborationStore.js';
import { calculateNewNodePosition, calculateEdgeThickness } from '../utils/position.js';

export const createCutPasteSlice = (set, get) => ({
  cutNode: null,

  cutNodeAction: (nodeId) => {
    const state = get();
    const nodeToCut = state.nodes.find(n => n.id === nodeId);
    if (!nodeToCut) return;

    const descendants = get().getAllDescendants(nodeId);
    
    // Find and remove the parent edge
    const parentEdge = state.edges.find(edge => 
      (edge.target === nodeId && !descendants.includes(edge.source))
    );

    set(state => ({
      nodes: state.nodes.map(node => {
        if (node.id === nodeId || descendants.includes(node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              isCut: true
            }
          };
        }
        return node;
      }),
      edges: state.edges
        .filter(edge => edge.id !== parentEdge?.id) // Remove parent edge
        .map(edge => {
          if (descendants.includes(edge.source) || descendants.includes(edge.target)) {
            return {
              ...edge,
              style: {
                ...edge.style,
                strokeDasharray: '5 5'
              }
            };
          }
          return edge;
        }),
      cutNode: {
        nodeId,
        descendants
      }
    }));
  },

  pasteNode: (targetNodeId) => {
    const state = get();
    if (!state.cutNode) return;

    const { nodeId: cutNodeId, descendants } = state.cutNode;
    const targetNode = state.nodes.find(n => n.id === targetNodeId);
    const cutNode = state.nodes.find(n => n.id === cutNodeId);
    
    if (!targetNode || !cutNode) return;

    const newPosition = calculateNewNodePosition(targetNode, state.nodes, state.edges, targetNode.data.direction);

    // Calculate new generation based on target node
    const newGeneration = targetNode.data.generation + 1;
    const generationDiff = newGeneration - cutNode.data.generation;

    // Create new edge from target to cut node
    const newParentEdge = {
      id: `e${targetNodeId}-${cutNodeId}`,
      source: targetNodeId,
      target: cutNodeId,
      type: 'default',
      style: {
        stroke: targetNode.data.color,
        strokeWidth: calculateEdgeThickness(cutNode, state.nodes, []),
        strokeDasharray: null,
        endArrow: false,
        startArrow: false,
        borderRadius: 20,
      }
    };

    set(state => ({
      nodes: state.nodes.map(node => {
        if (node.id === cutNodeId || descendants.includes(node.id)) {
          const nodeGeneration = node.id === cutNodeId ? 
            newGeneration : 
            node.data.generation + generationDiff;

          return {
            ...node,
            position: {
              x: node.id === cutNodeId ? newPosition.x : node.position.x + (newPosition.x - cutNode.position.x),
              y: node.id === cutNodeId ? newPosition.y : node.position.y + (newPosition.y - cutNode.position.y)
            },
            data: {
              ...node.data,
              isCut: false,
              direction: targetNode.data.direction,
              color: targetNode.data.color,
              generation: nodeGeneration
            }
          };
        }
        return node;
      }),
      edges: [
        // Keep edges that are not connected to cut node or its descendants
        ...state.edges.filter(edge => 
          !descendants.includes(edge.source) && 
          !descendants.includes(edge.target) &&
          edge.source !== cutNodeId &&
          edge.target !== cutNodeId
        ),
        // Add the new parent edge
        newParentEdge,
        // Update all descendant edges with new color and style
        ...state.edges
          .filter(edge => 
            (descendants.includes(edge.source) || descendants.includes(edge.target) ||
             edge.source === cutNodeId || edge.target === cutNodeId) &&
            edge.target !== cutNodeId // exclude old parent edge
          )
          .map(edge => {
            const targetNode = state.nodes.find(n => n.id === edge.target);
            const thickness = calculateEdgeThickness(targetNode, state.nodes, []);
            
            return {
              ...edge,
              type: 'default',
              style: {
                ...edge.style,
                stroke: targetNode.data.color,
                strokeDasharray: null,
                strokeWidth: thickness,
                endArrow: false,
                startArrow: false,
                borderRadius: 20,
              }
            };
          })
      ],
      cutNode: null
    }));

    useCollaborationStore.getState().sendUpdate({
      type: 'PASTE_NODES',
      nodes: state.nodes,
      edges: state.edges
    });
  },

  hasCutNode: () => {
    return get().cutNode !== null;
  },

  setCutNode: (nodeData) => {
    set({ cutNode: nodeData });
  },
}); 