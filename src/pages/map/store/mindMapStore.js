import { create } from 'zustand';
import { createNodeSlice } from './slices/nodeSlice.js';
import { createEdgeSlice } from './slices/edgeSlice.js';
import { createPresentationSlice } from './slices/presentationSlice.js';
import { createCutPasteSlice } from './slices/cutPasteSlice.js';
import { createBackgroundSlice } from './slices/backgroundSlice.js';

const useMindMapStore = create((set, get) => ({
  ...createNodeSlice(set, get),
  ...createEdgeSlice(set, get),
  ...createPresentationSlice(set, get),
  ...createCutPasteSlice(set, get),
  ...createBackgroundSlice(set, get),

  updateFromCollaboration: (update) => {
    switch (update.type) {
      case 'ADD_NODE':
        set((state) => ({
          nodes: [...state.nodes, update.node],
          edges: [...state.edges, update.edge].filter(Boolean),
        }));
        break;
      case 'UPDATE_NODE':
        set((state) => ({
          nodes: state.nodes.map(node => 
            node.id === update.node.id ? { ...node, ...update.node } : node
          ),
        }));
        break;
      case 'DELETE_NODE':
        set((state) => ({
          nodes: state.nodes.filter(node => node.id !== update.nodeId),
          edges: state.edges.filter(edge => 
            edge.source !== update.nodeId && edge.target !== update.nodeId
          ),
        }));
        break;
      default:
        console.warn('Unknown update type:', update.type);
    }
  },
}));

export default useMindMapStore;