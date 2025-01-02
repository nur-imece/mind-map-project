import { nanoid } from 'nanoid';

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

      newEdges.push({
        id: `e${source}-${target}`,
        source,
        target,
        style: { 
          stroke: state.nodes.find(n => n.id === source)?.data.color,
          strokeWidth: 2,
          strokeDasharray: dashArray
        }
      });

      const sourceNode = state.nodes.find(n => n.id === source);
      const targetNode = state.nodes.find(n => n.id === target);
      
      if (sourceNode && targetNode) {
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