import { nanoid } from 'nanoid';
import { calculateEdgeThickness } from '../utils/position.js';

export const createEdgeSlice = (set, get) => ({
  edges: [],
  selectedEdgeStyle: 'solid',

  onConnect: (connection) => {
    const { source, target } = connection;
    set((state) => {
      const connectionExists = state.edges.some(
        edge => edge.source === source && edge.target === target
      );
      
      if (connectionExists) return state;

      const newEdges = state.edges.filter(edge => edge.target !== target);
      
      let dashArray = '0';
      switch (state.selectedEdgeStyle) {
        case 'dashed':
          dashArray = '5,5';
          break;
        case 'dotted':
          dashArray = '2,2';
          break;
      }

      const sourceNode = state.nodes.find(n => n.id === source);
      const targetNode = state.nodes.find(n => n.id === target);

      if (sourceNode && targetNode) {
        const thickness = calculateEdgeThickness(targetNode, state.nodes, state.edges);

        newEdges.push({
          id: `e${source}-${target}`,
          source,
          target,
          style: { 
            stroke: sourceNode.data.color,
            strokeWidth: thickness,
            strokeDasharray: dashArray
          }
        });

        const newNodes = state.nodes.map(node => {
          if (node.id === target) {
            const newColor = sourceNode.data.color;
            const direction = sourceNode.position.x > node.position.x ? 'left' : 'right';
            return {
              ...node,
              data: {
                ...node.data,
                color: newColor,
                direction: direction
              }
            };
          }
          return node;
        });
        
        return { nodes: newNodes, edges: newEdges };
      }

      return { edges: newEdges };
    });
  },

  setEdgeStyle: (edgeId, style) => {
    set(state => ({
      edges: state.edges.map(edge => 
        edge.id === edgeId 
          ? { ...edge, style: { ...edge.style, ...style } }
          : edge
      )
    }));
  },

  setSelectedEdgeStyle: (style) => {
    set({ selectedEdgeStyle: style });
  },
}); 