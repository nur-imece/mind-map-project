export function resetNodeAfterError({ nodeId, getNodes, setNodes }) {
    const nodes = getNodes();
    setNodes(
        nodes.map(node => {
            if (node.id === nodeId && node.data.isLoading) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: node.data.originalLabel || 'Yeni düğüm',
                        isLoading: false,
                        originalLabel: undefined
                    },
                    style: node.originalStyle || {}
                };
            }
            return node;
        })
    );
}
