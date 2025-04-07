// Compute absolute position from relative position
import { EDGE_STYLES } from './edge-utils.js';

export function computeAbsolutePos(nodePos, parentAbsPos) {
  if (!parentAbsPos) {
    return {
      x: nodePos.left || 0,
      y: nodePos.top || 0
    };
  }
  return {
    x: parentAbsPos.x + (nodePos.left || 0),
    y: parentAbsPos.y + (nodePos.top || 0)
  };
}

// Get the closest handles between nodes
export function getClosestHandles(parentPos, childPos) {
  const dx = childPos.x - parentPos.x;
  const dy = childPos.y - parentPos.y;

  // Which is dominant? x or y
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal dominance
    if (dx < 0) {
      // parent sourceLeft => child targetRight
      return { sourceHandle: 'sourceLeft', targetHandle: 'targetRight' };
    } else {
      // parent sourceRight => child targetLeft
      return { sourceHandle: 'sourceRight', targetHandle: 'targetLeft' };
    }
  } else {
    // Vertical dominance
    if (dy < 0) {
      // parent sourceTop => child targetBottom
      return { sourceHandle: 'sourceTop', targetHandle: 'targetBottom' };
    } else {
      // parent sourceBottom => child targetTop
      return { sourceHandle: 'sourceBottom', targetHandle: 'targetTop' };
    }
  }
}

// Convert mind map data to React Flow format
export function convertMindMapToReactFlow(node, parentNode = null, nodesAcc = [], edgesAcc = []) {
  if (!node) return { nodes: nodesAcc, edges: edgesAcc };

  // Parent absolute position
  const parentAbsPos = parentNode?.data?.absPos || null;

  // JSON position
  const nodePos = node.position || { left: 0, top: 0 };

  // Absolute position for this node
  const absPos = computeAbsolutePos(nodePos, parentAbsPos);

  // Create React Flow node
  const newNode = {
    id: node.id,
    position: { x: absPos.x, y: absPos.y },
    data: {
      label: node.text || '',
      color: node.color,
      bgColor: node.bgColor,
      fontSize: node.fontSize,
      absPos // children will use this to compute their positions
    },
    type: 'customNode'
  };
  nodesAcc.push(newNode);

  // Create edge if has parent
  if (parentNode) {
    const parentHandlePos = parentNode.data?.absPos || { x: 0, y: 0 };
    const { sourceHandle, targetHandle } = getClosestHandles(parentHandlePos, absPos);
    
    // Use the first edge style from our styles array as default
    const defaultEdgeStyle = EDGE_STYLES[0];

    edgesAcc.push({
      id: `edge-${parentNode.id}-${node.id}`,
      source: parentNode.id,
      target: node.id,
      type: defaultEdgeStyle.type,
      style: defaultEdgeStyle.style,
      sourceHandle,
      targetHandle,
      data: {
        styleIndex: 0 // Store the index for later reference
      }
    });
  }

  // Process children recursively
  if (Array.isArray(node.children)) {
    node.children.forEach((child) => {
      convertMindMapToReactFlow(child, newNode, nodesAcc, edgesAcc);
    });
  }

  return { nodes: nodesAcc, edges: edgesAcc };
}

/**
 * Removes HTML tags from a string
 * @param {string} html - String containing HTML
 * @returns {string} Text without HTML tags
 */
export const stripHtmlTags = (html) => {
  if (!html) return '';
  return html.replace(/<\/?[^>]+(>|$)/g, '');
}; 