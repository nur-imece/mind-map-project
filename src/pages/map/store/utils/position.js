export function calculateNewNodePosition(parentNode, nodes, edges, direction = 'right') {
  if (!parentNode) {
    return { x: 0, y: 0 };
  }

  const BASE_RADIUS = 150; // Temel yarıçap
  const OFFSET = 50; // Çakışma durumunda kaydırma ofseti
  const parentId = parentNode.id;

  // Kardeş node'ları bul (aynı yönde olanlar)
  const siblings = nodes.filter(child =>
      edges.some(edge => edge.source === parentId && edge.target === child.id) &&
      child.data.direction === direction
  );

  // Kuşak seviyesini hesapla
  let generation = 1;
  let currentNode = parentNode;
  while (edges.some(edge => edge.target === currentNode.id)) {
    generation++;
    currentNode = nodes.find(node =>
        edges.some(edge => edge.source === node.id && edge.target === currentNode.id)
    );
  }

  // Her kuşak için yarıçapı artır
  const radius = BASE_RADIUS + (generation - 1) * 50;

  // İlk node için özel durum
  if (siblings.length === 0) {
    if (direction === 'right') {
      return {
        x: parentNode.position.x + radius,
        y: parentNode.position.y
      };
    } else {
      return {
        x: parentNode.position.x - radius,
        y: parentNode.position.y
      };
    }
  }

  // Her yarım çemberde maksimum 6 node olsun
  const nodesPerLevel = 6;
  const currentLevel = Math.floor(siblings.length / nodesPerLevel);
  const positionInLevel = siblings.length % nodesPerLevel;

  // Yarım çember açı hesaplaması
  const angleStep = Math.PI / (nodesPerLevel + 1);
  const angle = angleStep * (positionInLevel + 1);

  // Sağ veya sol yarım çember için pozisyon hesapla
  let x, y;
  const adjustedRadius = radius + currentLevel * 100; // Katman genişliği
  if (direction === 'right') {
    // Sağ yarım çember: yatayda sağa doğru açılma
    x = parentNode.position.x + adjustedRadius;
    y = parentNode.position.y + adjustedRadius * Math.sin(angle); // Dikey kayma
  } else {
    // Sol yarım çember: yatayda sola doğru açılma
    x = parentNode.position.x - adjustedRadius;
    y = parentNode.position.y + adjustedRadius * Math.sin(angle); // Dikey kayma
  }

  // Çakışmayı engelle
  while (nodes.some(node =>
      Math.abs(node.position.y - y) < OFFSET &&
      Math.abs(node.position.x - x) < OFFSET
  )) {
    y += OFFSET; // Çakışmayı önlemek için y pozisyonunu kaydır
  }

  return { x, y };
}

export function calculateEdgeThickness() {
  return 5; // Her zaman sabit bir kalınlık döndür
}
