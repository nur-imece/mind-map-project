import React from 'react';
import { Handle, Position } from 'reactflow';
import '../index.scss';

/**
 * Node üzerindeki Handle'ları render eder.
 */
const Handles = ({ data, selected, isConnectable }) => {
    // Eğer image node ise farklı stil
    if (data.isImageNode) {
        const imageHandleStyle = {
            width: '12px',
            height: '12px',
            background: selected ? '#fff' : 'transparent',
            border: selected ? '2px solid #1890ff' : 'none',
            borderRadius: '50%',
            zIndex: 10
        };

        return (
            <>
                {/* Left */}
                <Handle
                    id="targetLeft"
                    type="target"
                    position={Position.Left}
                    isConnectable={isConnectable}
                    style={{
                        ...imageHandleStyle,
                        left: '-6px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}
                />
                <Handle
                    id="sourceLeft"
                    type="source"
                    position={Position.Left}
                    isConnectable={isConnectable}
                    style={{
                        ...imageHandleStyle,
                        left: '-6px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}
                />

                {/* Right */}
                <Handle
                    id="targetRight"
                    type="target"
                    position={Position.Right}
                    isConnectable={isConnectable}
                    style={{
                        ...imageHandleStyle,
                        right: '-6px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}
                />
                <Handle
                    id="sourceRight"
                    type="source"
                    position={Position.Right}
                    isConnectable={isConnectable}
                    style={{
                        ...imageHandleStyle,
                        right: '-6px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}
                />
            </>
        );
    }

    // Normal node (tüm handle’lar gizli veya şeffaf)
    return (
        <>
            <Handle
                id="targetLeft"
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                className="node-handle hidden-handle"
                style={{ opacity: 0 }}
            />
            <Handle
                id="targetRight"
                type="target"
                position={Position.Right}
                isConnectable={isConnectable}
                className="node-handle hidden-handle"
                style={{ opacity: 0 }}
            />
            <Handle
                id="targetTop"
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="node-handle hidden-handle"
                style={{ opacity: 0 }}
            />
            <Handle
                id="targetBottom"
                type="target"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="node-handle hidden-handle"
                style={{ opacity: 0 }}
            />
            <Handle
                id="sourceLeft"
                type="source"
                position={Position.Left}
                isConnectable={isConnectable}
                className="node-handle hidden-handle"
                style={{ opacity: 0 }}
            />
            <Handle
                id="sourceRight"
                type="source"
                position={Position.Right}
                isConnectable={isConnectable}
                className="node-handle hidden-handle"
                style={{ opacity: 0 }}
            />
            <Handle
                id="sourceTop"
                type="source"
                position={Position.Top}
                isConnectable={isConnectable}
                className="node-handle hidden-handle"
                style={{ opacity: 0 }}
            />
            <Handle
                id="sourceBottom"
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="node-handle hidden-handle"
                style={{ opacity: 0 }}
            />
        </>
    );
};

export default Handles;
