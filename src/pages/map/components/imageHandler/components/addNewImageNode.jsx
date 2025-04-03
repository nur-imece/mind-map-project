import { v4 as uuidv4 } from 'uuid';

export function addNewImageNode({
                                    position,
                                    imagePath,
                                    getNodes,
                                    setNodes,
                                    setEdges
                                }) {
    const newNodeId = uuidv4();
    const imageHTML = `
    <div class="image-node-container">
      <img 
        src="${imagePath}" 
        alt="Node Image" 
        class="node-image" 
        data-node-id="${newNodeId}"
        data-original-path="${imagePath}"
        style="max-width: 100%; height: auto; object-fit: contain;"
      />
      <div class="image-controls">
        <span class="image-control remove-image" title="Resmi Kaldır">×</span>
        <span class="image-control zoom-in" title="Büyüt">+</span>
        <span class="image-control zoom-out" title="Küçült">−</span>
      </div>
    </div>
  `;

    const nodes = getNodes();
    const parentNode = nodes.find(n => n.id === position);
    if (!parentNode) return;

    // Yeni düğüm
    const newNode = {
        id: newNodeId,
        position: { x: 0, y: 0 },
        type: 'customNode',
        data: {
            label: imageHTML,
            nodeType: 'image',
            color: '#ffffff',
            imagePath,
            showButtons: true,
            isImageNode: true
        },
        parentNode: position,
        style: {
            width: 'auto',
            maxWidth: '300px',
            height: 'auto',
            padding: 0
        }
    };

    // Konum hesaplama
    const childNodes = nodes.filter(n => n.parentNode === position);
    const length = childNodes.length;
    newNode.position = {
        x: 150,
        y: (length * 100)
    };

    // Yeni edge
    const newEdge = {
        id: `${position}-${newNodeId}`,
        source: position,
        target: newNodeId,
        type: 'custom',
        style: { stroke: '#000000' },
        data: { curvature: 0 }
    };

    setNodes(nds => nds.concat(newNode));
    setEdges(eds => eds.concat(newEdge));
}
