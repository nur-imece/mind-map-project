/**
 * HTML içeriğinden düz metin çıkarma
 */
export function getPlainTextFromHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html || '';
    return tempDiv.textContent || tempDiv.innerText || '';
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
 * Node’un konumunu (root/left/right) bulmak için
 * bir edge üzerinde kaynağın hangi handle'ının kullanıldığını kontrol edebiliriz.
 */
export function getNodePosition(edges, nodeId) {
    const incomingEdge = edges.find(edge => edge.target === nodeId);
    if (!incomingEdge) return 'root';

    if (incomingEdge.sourceHandle === 'sourceLeft' || incomingEdge.sourceHandle === 'sourceBottom') {
        return 'left';
    } else if (incomingEdge.sourceHandle === 'sourceRight' || incomingEdge.sourceHandle === 'sourceTop') {
        return 'right';
    }
    return 'unknown';
}
