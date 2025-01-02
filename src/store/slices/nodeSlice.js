// src/store/createNodeSlice.js
import { nanoid } from 'nanoid';
import { calculateNewNodePosition } from '../utils/position';
import { COLORS, ROOT_COLOR } from '../constants';
import useCollaborationStore from '../collaborationStore';

export const createNodeSlice = (set, get) => ({
  nodes: [],
  edges: [],

  getAllDescendants: (nodeId) => {
    const state = get();
    const result = new Set();
    const startNode = state.nodes.find((n) => n.id === nodeId);
    if (!startNode) return [];

    const traverse = (currentId) => {
      // Sadece source === currentId mantığıyla çocukları bul
      const children = state.edges
        .filter((edge) => edge.source === currentId)
        .map((edge) => edge.target);

      console.log('Found children for node:', currentId, children);

      children.forEach((childId) => {
        result.add(childId);
        traverse(childId);
      });
    };

    traverse(nodeId);
    console.log('All descendants for node:', nodeId, Array.from(result));
    return Array.from(result);
  },

  addNode: (parentNode, label = 'Yeni Dal', type = 'branch', direction = 'right') => {
    console.log('Adding node with direction:', direction);
    const generation = parentNode ? parentNode.data.generation + 1 : 0;
    let color;

    // Eğer parentNode yok ama zaten bir root node varsa...
    if (!parentNode && get().nodes.some((node) => node.data.isRoot)) {
      console.warn('Zaten bir ana node var.');
      return null;
    }

    // Renk seçimi
    if (!parentNode) {
      // Root node
      color = ROOT_COLOR;
    } else if (generation === 1) {
      // 1. nesil alt dallar -> COLORS[direction] dizisinden
      const existingFirstGen = get().nodes.filter(
        (node) => node.data.generation === 1 && node.data.direction === direction
      ).length;
      color = COLORS[direction][existingFirstGen % COLORS[direction].length];
    } else {
      // Diğer nesiller parent'ın rengini miras alır
      color = parentNode.data.color;
    }

    // Yeni node
    const newNode = {
      id: nanoid(),
      type: 'mindMap',
      data: {
        label,
        isRoot: !parentNode,
        generation,
        direction, // NodeButtons'tan gelen direction'ı koru
        color,
        type,
        style: {
          bold: false,
          italic: false,
          underline: false,
          align: 'center',
          size: get().nodes.length === 0 ? 16 : 14,
          shape: type === 'text' ? 'none' : 'rounded',
          fontFamily: 'Indie Flower',
          fontSize: 'Auto',
          boxSize: 'Auto',
          color: '#666',
        },
        // Bu node üstünden yeni dal ekleme vb. fonksiyonlar
        onAdd: (dir) => {
          console.log('onAdd called with direction:', dir);
          return get().addNode(newNode, 'Yeni Dal', 'branch', dir);
        },
        onAddText: (dir) => get().addTextNode(newNode, dir),
        onAddImage: (imageUrl, dir) => get().addImageNode(newNode, imageUrl, dir),
        onDelete: () => get().deleteNode(newNode.id),
        onUpdateLabel: (newLabel) => get().updateNodeLabel(newNode.id, newLabel),
        onUpdateStyle: (newStyle) => get().updateNodeStyle(newNode.id, newStyle),
        parentNode: parentNode ? parentNode.id : null, // Parent ID'yi sakla
      },
      position: calculateNewNodePosition(parentNode, get().nodes, get().edges, direction),
    };

    // Edge: Her zaman parent -> child mantığıyla, ama yön önemli
    const newEdge = parentNode
      ? {
          id: nanoid(),
          source: parentNode.id,
          target: newNode.id,
          type: 'smoothstep',
          // Sol taraf için parent'ın sol source handle'ından çıkıp child'ın sağ target handle'ına
          // Sağ taraf için parent'ın sağ source handle'ından çıkıp child'ın sol target handle'ına
          sourceHandle: direction === 'left' ? 'leftSource' : 'rightSource',
          targetHandle: direction === 'left' ? 'rightTarget' : 'leftTarget',
          animated: false,
          style: {
            stroke: color,
            strokeWidth: 2,
          },
        }
      : null;

    console.log('Current edges before update:', get().edges);
    console.log('New edge to be added:', newEdge);

    // Store'a ekle - önceki edges'i koru
    set((state) => {
      const newState = {
        nodes: [...state.nodes, newNode],
        edges: newEdge ? [...state.edges, newEdge] : state.edges,
      };
      console.log('Updated edges after set:', newState.edges);
      return newState;
    });

    // Gerçek zamanlı iş birliği store'una da gönder
    useCollaborationStore.getState().sendUpdate({
      type: 'ADD_NODE',
      node: newNode,
      edge: newEdge,
    });

    return newNode;
  },

  // Metin düğümü ekleme
  addTextNode: (parentNode, direction) => {
    return get().addNode(parentNode, 'Yeni Metin', 'text', direction);
  },

  // Resim düğümü ekleme
  addImageNode: (parentNode, imageUrl, direction) => {
    console.log('Adding image node:', imageUrl.substring(0, 100)); 
    return get().addNode(parentNode, imageUrl, 'image', direction);
  },

  // Belirli bir node'un pozisyonunu güncelle (sürükleyince)
  updateNodePosition: (nodeId, newPosition) => {
    set((state) => {
      const movingNode = state.nodes.find((node) => node.id === nodeId);
      if (!movingNode) return state;

      const oldPosition = movingNode.position;
      const deltaX = newPosition.x - oldPosition.x;
      const deltaY = newPosition.y - oldPosition.y;

      // Tüm alt düğümleri de taşı
      const descendants = get().getAllDescendants(nodeId);
      return {
        nodes: state.nodes.map((node) => {
          if (node.id === nodeId || descendants.includes(node.id)) {
            return {
              ...node,
              position: {
                x: node.position.x + deltaX,
                y: node.position.y + deltaY,
              },
            };
          }
          return node;
        }),
      };
    });
  },

  // Etiketi (label) güncelle
  updateNodeLabel: (nodeId, label) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                label,
                // Eğer label resim datası ise tipini 'image' yap
                type: label.startsWith('data:image/') ? 'image' : node.data.type,
              },
            }
          : node
      ),
    }));
  },

  // Stil güncelle (font, renk vb.)
  updateNodeStyle: (nodeId, style) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                style: {
                  ...node.data.style,
                  ...style,
                },
              },
            }
          : node
      ),
    }));
  },

  // Node sil
  deleteNode: (nodeId) => {
    console.log('Deleting node:', nodeId);
    console.log('Current edges before delete:', get().edges);

    // Tüm alt düğümleri (descendants) de silmek için yardımcı fonksiyon
    const descendants = get().getAllDescendants(nodeId);
    const nodesToDelete = [nodeId, ...descendants];

    console.log('Nodes to be deleted:', nodesToDelete);

    set((state) => {
      const newState = {
        nodes: state.nodes.filter((n) => !nodesToDelete.includes(n.id)),
        edges: state.edges.filter(
          (edge) =>
            !nodesToDelete.includes(edge.source) &&
            !nodesToDelete.includes(edge.target)
        ),
      };
      console.log('Updated edges after delete:', newState.edges);
      return newState;
    });

    // CollaborationStore'a bildirim
    useCollaborationStore.getState().sendUpdate({
      type: 'DELETE_NODE',
      nodeId,
    });
  },
});
