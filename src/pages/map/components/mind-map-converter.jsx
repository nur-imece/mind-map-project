import { useCallback } from 'react';

const useMindMapConverter = () => {
  // Convert nodes and edges to mind map content format
  const convertToMindMapContent = useCallback((nodes, edges) => {
    // Kök node'u bul (genellikle id'si "1" veya sadece bir tane kök)
    const rootNode = nodes.find(node => !edges.some(edge => edge.target === node.id));
    
    // Save edge styles for later use when reconstructing
    const edgeStylesMap = {};
    edges.forEach(edge => {
      edgeStylesMap[`${edge.source}-${edge.target}`] = {
        type: edge.type,
        style: edge.style,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      };
    });
    
    // Rekürsif olarak ağaç yapısını oluştur
    const buildTree = (nodeId, parentPos = null) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return null;
      
      // Bu node'a bağlı tüm kenarları (children) bul
      const childEdges = edges.filter(e => e.source === nodeId);
      
      // Calculate positions - for root use absolute, for children use relative to parent
      let position;
      if (parentPos) {
        // For children, store relative positions to parent
        position = {
          left: node.position.x - parentPos.x,
          top: node.position.y - parentPos.y
        };
      } else {
        // For root, store absolute position
        position = {
          left: node.position.x,
          top: node.position.y
        };
      }
      
      // Process children with this node's position as their parent
      const children = childEdges.map(e => buildTree(e.target, node.position)).filter(Boolean);
      
      return {
        id: node.id,
        text: node.data.label,
        color: node.data.color,
        bgColor: node.data.bgColor,
        fontSize: node.data.fontSize,
        position: position,
        children: children.length > 0 ? children : []
      };
    };
    
    const rootTree = rootNode ? buildTree(rootNode.id) : null;
    
    return {
      root: rootTree,
      version: "1.0",
      edgeStyles: edgeStylesMap,
      timestamp: new Date().toISOString()
    };
  }, []);

  return {
    convertToMindMapContent
  };
};

export default useMindMapConverter; 