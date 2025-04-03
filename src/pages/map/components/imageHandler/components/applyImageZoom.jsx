export function applyImageZoom(nodeRef, zoomLevel) {
    if (nodeRef.current) {
        const imgElement = nodeRef.current.querySelector('.node-image');
        if (imgElement) {
            const zoomFactor = zoomLevel / 100;
            imgElement.style.transform = `scale(${zoomFactor})`;
            imgElement.style.transformOrigin = 'center center';
        }

        const controls = nodeRef.current.querySelector('.image-controls');
        if (controls) {
            controls.style.position = 'absolute';
            controls.style.top = '5px';
            controls.style.right = '5px';
            controls.style.zIndex = '1000';
        }
    }
}
