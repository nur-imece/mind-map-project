/**
 * HTML içeriğinden düz metin çıkarma
 */
export function getPlainTextFromHTML(html) {
    if (!html) return '';
    // Basit düz metin dönüşümü (detaylı HTML parser eklenebilir)
    return html
        .replace(/<[^>]*>/g, '') // HTML etiketlerini kaldır
        .replace(/&nbsp;/g, ' ') // HTML boşluklarını düzelt
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

/**
 * Çakışma yaratmayacak şekilde yeni node pozisyonu bulma
 */
export function findPositionWithoutOverlap(parentX, parentY, direction, allNodes) {
    // Node ölçüleri (ortalama değerler)
    const nodeWidth = 160;
    const nodeHeight = 60;
    const margin = 20;
    const offset = 260;

    let newX = (direction === 'right')
        ? parentX + nodeWidth + offset
        : parentX - nodeWidth - offset;

    let newY = parentY;

    const overlaps = (x1, y1, node2) => {
        const x2 = node2.position.x;
        const y2 = node2.position.y;
        const w2 = node2.__width || nodeWidth;
        const h2 = node2.__height || nodeHeight;
        const totalWidth = nodeWidth + margin;
        const totalHeight = nodeHeight + margin;
        return !(
            x1 + totalWidth < x2 ||
            x1 > x2 + w2 + margin ||
            y1 + totalHeight < y2 ||
            y1 > y2 + h2 + margin
        );
    };

    const verticalStep = 80;
    while (allNodes.some(n => overlaps(newX, newY, n))) {
        newY += verticalStep;
    }

    return { x: newX, y: newY };
}

/**
 * Node'un konumunu (root/left/right) bulmak için
 * bir edge üzerinde kaynağın hangi handle'ının kullanıldığını kontrol edebiliriz.
 */
export function getNodePosition(edges, nodeId) {
    if (!edges || !nodeId) return 'none';

    // 1. Düğüm bir hedef olduğunda (bağımsız değişken)
    const incomingEdge = edges.find(edge => edge.target === nodeId);
    if (!incomingEdge) return 'root'; // Gelen kenar yoksa kök düğüm

    // 2. Bağlı olduğu düğüme göre konum belirleme
    const sourceHandle = incomingEdge.sourceHandle;
    if (sourceHandle === 'sourceRight') return 'right';
    if (sourceHandle === 'sourceLeft') return 'left';

    // 3. Handle belirtilmemişse, varsayılan değerlere dönüş
    return 'none';
}

/**
 * Yumuşak rastgele renkler üretme
 * Pastel ve rahat görünen renkler üretir
 */
export function getRandomSoftColor() {
    // Pastel renkler için HSL kullanma (daha parlak ve soft renkler)
    // Hue: 0-360 (ton), Saturation: 25-50% (soft), Lightness: 75-85% (parlak)
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 25) + 25; // %25-%50 aralığı
    const lightness = Math.floor(Math.random() * 10) + 75;  // %75-%85 aralığı
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Kutu şekilleri
 */
export const NODE_SHAPES = [
    { name: 'round', borderRadius: '50px' },
    { name: 'rounded', borderRadius: '8px' },
    { name: 'sharp', borderRadius: '0' },
    { name: 'circle', borderRadius: '50%' },
    { name: 'hexagon', borderRadius: '0', customStyle: { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' } },
    { name: 'diamond', borderRadius: '0', customStyle: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' } },
    { name: 'triangle', borderRadius: '0', customStyle: { clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' } },
    { name: 'star', borderRadius: '0', customStyle: { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' } }
];

/**
 * Font aileleri
 */
export const FONT_FAMILIES = [
    { name: 'Default', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { name: 'Courier New', value: '"Courier New", Courier, monospace' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
    { name: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
    { name: 'Impact', value: 'Impact, Charcoal, sans-serif' },
    { name: 'Lucida Console', value: '"Lucida Console", Monaco, monospace' }, 
    { name: 'Palatino', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
    { name: 'Garamond', value: 'Garamond, serif' },
    { name: 'Bookman', value: '"Bookman Old Style", serif' },
    { name: 'Comic Sans MS', value: '"Comic Sans MS", cursive, sans-serif' },
    { name: 'Century Gothic', value: '"Century Gothic", sans-serif' }
];
