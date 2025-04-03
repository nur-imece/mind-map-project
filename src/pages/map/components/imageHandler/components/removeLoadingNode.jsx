export function removeLoadingNode({ getNodes, getEdges, setNodes, setEdges }) {
    const loadingNodeId = sessionStorage.getItem('loadingNodeId');
    if (loadingNodeId) {
        const currentNodes = getNodes();
        const currentEdges = getEdges();
        setNodes(currentNodes.filter(node => node.id !== loadingNodeId));
        setEdges(currentEdges.filter(edge => edge.target !== loadingNodeId));
        sessionStorage.removeItem('loadingNodeId');
    }
}
