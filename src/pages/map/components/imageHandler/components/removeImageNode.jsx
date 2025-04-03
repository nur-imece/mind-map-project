
export function removeImageNode({
                                    nodeId,
                                    getNodes,
                                    getEdges,
                                    setNodes
                                }) {
    const nodes = getNodes();
    const edges = getEdges();

    const currentNode = nodes.find(node => node.id === nodeId);
    if (!currentNode) return;

    // Bu düğüme bağlanan parent'ı bul
    const parentEdge = edges.find(edge => edge.target === nodeId);
    const parentNode = parentEdge ? nodes.find(n => n.id === parentEdge.source) : null;

    const parentStyle = parentNode ? {
        bgColor: parentNode.data.bgColor || '#FFFFFF',
        color: parentNode.data.color || '#000000',
        fontSize: parentNode.data.fontSize || 16,
        borderColor: parentNode.data.color || '#000000'
    } : {
        bgColor: '#FFFFFF',
        color: '#000000',
        fontSize: 16,
        borderColor: '#000000'
    };

    // Yeni bir metin düğümü görünümü
    const updatedNode = {
        ...currentNode,
        data: {
            ...currentNode.data,
            label: "Yeni düğüm",
            bgColor: parentStyle.bgColor,
            color: parentStyle.color,
            fontSize: parentStyle.fontSize,
            isImageNode: false,
            noBorder: false,
            image: null
        },
        style: {
            width: null,
            height: null,
            padding: null
        }
    };

    const updatedNodes = nodes.map(node =>
        node.id === nodeId ? updatedNode : node
    );

    setNodes(updatedNodes);
}
