/* Yardımcı Fonksiyonlar */
import { EDGE_STYLES } from '@/pages/map/components/edge-utils.js';

// 1) computeAbsolutePos: child = parent + childRelative
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

// 2) getClosestHandles:
// 4 olası source handle (sourceLeft, sourceRight, sourceTop, sourceBottom)
// 4 olası target handle (targetLeft, targetRight, targetTop, targetBottom)
// Basit yaklaşım:
//  - Hangisi baskınsa x mi y mi,
//  - dx < 0 => parent's sourceLeft + child's targetRight, vb.
export function getClosestHandles(parentPos, childPos) {
  // parentPos, childPos => mutlak (x,y)
  const dx = childPos.x - parentPos.x;
  const dy = childPos.y - parentPos.y;

  // Hangisi büyük? x mi y mi
  if (Math.abs(dx) > Math.abs(dy)) {
    // Yatay baskın
    if (dx < 0) {
      // parent sourceLeft => child targetRight
      return { sourceHandle: 'sourceLeft', targetHandle: 'targetRight' };
    } else {
      // parent sourceRight => child targetLeft
      return { sourceHandle: 'sourceRight', targetHandle: 'targetLeft' };
    }
  } else {
    // Dikey baskın
    if (dy < 0) {
      // parent sourceTop => child targetBottom
      return { sourceHandle: 'sourceTop', targetHandle: 'targetBottom' };
    } else {
      // parent sourceBottom => child targetTop
      return { sourceHandle: 'sourceBottom', targetHandle: 'targetTop' };
    }
  }
}

/* Konvert Fonksiyonu
   - side vs. yok, handle seçimi getClosestHandles ile
   - 2. seviye children konumu = parentAbs + childRelative
*/
export function convertMindMapToReactFlow(node, parentNode = null, nodesAcc = [], edgesAcc = [], options = {}) {
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
      absPos, // children will use this to compute their positions
      nodeType: node.imageItem ? 'image' : 'text' // Set nodeType based on node properties
    },
    type: 'customNode'
  };

  // If this is an image node, handle the image data
  if (node.imageItem && node.image) {
    // Set the image in the node data
    newNode.data.image = node.image;
    newNode.data.label = `<div class="image-container"><img src="${node.image}" alt="Image" style="max-width: 100%; object-fit: cover;"/></div>`;
  }

  nodesAcc.push(newNode);

  // Create edge if has parent
  if (parentNode) {
    // Determine sourceHandle and targetHandle based on node position
    let sourceHandle, targetHandle;

    // Check if we have stored edge styles from previous save
    const edgeStylesMap = options.edgeStyles || {};
    const edgeKey = `${parentNode.id}-${node.id}`;
    const savedEdgeStyle = edgeStylesMap[edgeKey];

    if (savedEdgeStyle) {
      // Use saved edge style
      sourceHandle = savedEdgeStyle.sourceHandle;
      targetHandle = savedEdgeStyle.targetHandle;
    } else {
      // Compute best handles based on positions
      const { sourceHandle: sHandle, targetHandle: tHandle } = getClosestHandles(
        parentNode.data.absPos,
        absPos
      );
      sourceHandle = sHandle;
      targetHandle = tHandle;
    }

    // Use saved edge style or default
    let edgeType = 'default';
    let edgeStyle = { strokeWidth: 1.5 };
    let edgeStyleInfo = { name: 'Default', description: 'Standard line' };

    if (savedEdgeStyle) {
      edgeType = savedEdgeStyle.type || 'default';
      edgeStyle = {
        ...edgeStyle, // Base style
        ...(savedEdgeStyle.style || {}), // Saved style props (dasharray, etc.)
      };
      
      // Find edge style info from predefined styles
      const matchedStyle = EDGE_STYLES.find(style => {
        // Check type match first
        if (style.type !== edgeType) return false;
        
        // Compare style properties while ignoring stroke color
        const styleKeys = Object.keys(style.style).filter(key => key !== 'stroke');
        
        // Check if all style properties match
        return styleKeys.every(key => {
          if (key === 'strokeDasharray') {
            return style.style[key] === edgeStyle[key];
          }
          return style.style[key] === edgeStyle[key];
        });
      });
      
      if (matchedStyle) {
        edgeStyleInfo = matchedStyle;
      }
    }

    // Add parent's color to edge style
    edgeStyle.stroke = parentNode.data.color || '#1890ff';

    edgesAcc.push({
      id: `edge-${parentNode.id}-${node.id}`,
      source: parentNode.id,
      target: node.id,
      type: edgeType,
      style: edgeStyle,
      sourceHandle,
      targetHandle,
      data: {
        styleName: edgeStyleInfo.name,
        styleDescription: edgeStyleInfo.description
      }
    });
  }

  // Alt düğümler
  if (Array.isArray(node.children)) {
    node.children.forEach((child) => {
      convertMindMapToReactFlow(child, newNode, nodesAcc, edgesAcc, options);
    });
  }

  return { nodes: nodesAcc, edges: edgesAcc };
} 