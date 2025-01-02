import useCollaborationStore from '../collaborationStore';
import { calculateNewNodePosition } from '../utils/position';

export const createCutPasteSlice = (set, get) => ({
  cutNode: null,

  cutNodeAction: (nodeId) => {
    const state = get();
    const nodeToCut = state.nodes.find(n => n.id === nodeId);
    if (!nodeToCut) return;

    const descendants = get().getAllDescendants(nodeId);
    
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
      edges: state.edges.map(edge => {
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

    const oldParentEdge = state.edges.find(edge => 
      (edge.source === cutNodeId && !descendants.includes(edge.target)) ||
      (edge.target === cutNodeId && !descendants.includes(edge.source))
    );

    const newParentEdge = {
      id: `e${targetNode.id}-${cutNodeId}`,
      source: targetNode.data.direction === 'left' ? cutNodeId : targetNode.id,
      target: targetNode.data.direction === 'left' ? targetNode.id : cutNodeId,
      type: 'smoothstep',
      sourceHandle: targetNode.data.direction === 'left' ? 'left' : 'right',
      targetHandle: null,
      style: {
        stroke: targetNode.data.color,
        strokeWidth: 2
      }
    };

    set(state => ({
      nodes: state.nodes.map(node => {
        if (node.id === cutNodeId || descendants.includes(node.id)) {
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
              color: targetNode.data.color
            }
          };
        }
        return node;
      }),
      edges: [
        ...state.edges.filter(edge => edge.id !== oldParentEdge?.id),
        newParentEdge
      ].map(edge => {
        if (edge.source === cutNodeId || edge.target === cutNodeId ||
            descendants.includes(edge.source) || descendants.includes(edge.target)) {
          return {
            ...edge,
            style: {
              ...edge.style,
              stroke: targetNode.data.color,
              strokeDasharray: null
            }
          };
        }
        return edge;
      }),
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