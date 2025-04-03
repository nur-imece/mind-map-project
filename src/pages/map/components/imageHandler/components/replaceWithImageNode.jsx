// src/components/ImageHandler/useImageHandler/replaceWithImageNode.js

export function replaceWithImageNode({
                                         nodeId,
                                         imagePath,
                                         position,
                                         existingPosition,
                                         getNodes,
                                         getEdges,
                                         setNodes,
                                         setEdges
                                     }) {
    const nodes = getNodes();
    const edges = getEdges();

    // Find the node to replace
    const nodeToReplace = nodes.find(node => node.id === nodeId);
    if (!nodeToReplace) return;

    const imageHTML = `
    <div class="image-node-container">
      <img 
        src="${imagePath}" 
        alt="Node Image" 
        class="node-image" 
        data-node-id="${nodeId}"
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

    const updatedNode = {
        ...nodeToReplace,
        data: {
            ...nodeToReplace.data,
            label: imageHTML,
            nodeType: 'image',
            imagePath,
            showButtons: true,
            isImageNode: true
        },
        position: existingPosition || nodeToReplace.position,
        style: {
            width: 'auto',
            maxWidth: '300px',
            height: 'auto',
            padding: 0
        }
    };

    // Update edges (making them direct, for example)
    const updatedEdges = edges.map(edge => {
        if (edge.target === nodeId) {
            return {
                ...edge,
                data: { ...edge.data, curvature: 0 }
            };
        }
        return edge;
    });

    setNodes(nodes.map(node => (node.id === nodeId ? updatedNode : node)));
    setEdges(updatedEdges);
}
