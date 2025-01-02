export function calculateNewNodePosition(parentNode, nodes, edges, direction = 'right') {
    if (!parentNode) {
      return { x: 0, y: 0 };
    }
  
    const HORIZONTAL_SPACING = 180;
    const VERTICAL_SPACING = 60;
  
    const parentId = parentNode.id;
  
    // Kardeş node'ları bul (aynı yönde olanlar)
    const siblings = nodes.filter(child =>
      edges.some(edge => edge.source === parentId && edge.target === child.id) &&
      child.data.direction === direction
    );
  
    // X pozisyonu: yöne göre pozitif veya negatif offset
    const x = parentNode.position.x + (direction === 'right' ? HORIZONTAL_SPACING : -HORIZONTAL_SPACING);
  
    // İlk node için parent ile aynı y seviyesi
    if (siblings.length === 0) {
      return { x, y: parentNode.position.y };
    }
  
    // Sırayla yukarı ve aşağı ekle
    const siblingCount = siblings.length + 1;
    const isEven = siblingCount % 2 === 0;
    const offset = Math.floor(siblingCount / 2) * VERTICAL_SPACING;
    const y = parentNode.position.y + (isEven ? offset : -offset);
  
    return { x, y };
  }
  