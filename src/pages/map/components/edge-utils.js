// Different edge styles that will rotate when clicked
export const EDGE_STYLES = [
  // Düz Çizgi (Solid Line)
  {
    type: 'straight',
    style: { strokeWidth: 2 },
    name: 'Düz Çizgi',
    description: 'Standart ilişkiler için basit, sade, okunabilir bağlantı'
  },
  // Kesikli Çizgi (Dashed Line)
  {
    type: 'straight',
    style: { strokeWidth: 2, strokeDasharray: '5,5' },
    name: 'Kesikli Çizgi',
    description: 'Zayıf ilişki, opsiyonel bağlantı veya öneri göstermek için'
  },
  // Noktalı Çizgi (Dotted Line)
  {
    type: 'straight',
    style: { strokeWidth: 2, strokeDasharray: '1,3' },
    name: 'Noktalı Çizgi',
    description: 'Bilgi notu, açıklama ilişkisi için'
  }
];

// Get the next edge style in rotation
export function getNextEdgeStyle(currentType, currentStyle) {
  console.log('Current Type:', currentType);
  console.log('Current Style:', currentStyle);
  
  // Find current index
  const currentIndex = EDGE_STYLES.findIndex(
    style => 
      style.type === currentType && 
      isStyleEqual(style.style, currentStyle)
  );
  
  console.log('Current Index:', currentIndex);
  
  // If not found or last element, start from the beginning
  if (currentIndex === -1 || currentIndex === EDGE_STYLES.length - 1) {
    console.log('Returning first style:', EDGE_STYLES[0]);
    return EDGE_STYLES[0];
  }
  
  // Return the next style
  console.log('Returning next style:', EDGE_STYLES[currentIndex + 1]);
  return EDGE_STYLES[currentIndex + 1];
}

// Helper to compare styles since JSON.stringify can be unreliable
function isStyleEqual(style1, style2) {
  if (!style1 || !style2) return false;
  
  // Renk ve stroke özelliklerini karşılaştırmadan çıkar
  const { stroke: stroke1, ...rest1 } = style1;
  const { stroke: stroke2, ...rest2 } = style2;
  
  const keys1 = Object.keys(rest1);
  const keys2 = Object.keys(rest2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => {
    if (key === 'strokeDasharray') {
      return rest1[key] === rest2[key];
    }
    return rest1[key] === rest2[key];
  });
} 