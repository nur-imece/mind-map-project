// CustomNode.jsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

/**
 * side: 'root'   => 4 tane source handle (top/right/bottom/left)
 * side: 'left'   => sourceLeft, targetRight
 * side: 'right'  => sourceRight, targetLeft
 * side: 'top'    => sourceTop, targetBottom
 * side: 'bottom' => sourceBottom, targetTop
 */
const CustomNode = memo(({ data, isConnectable, selected }) => {
    return (
        <div
            className={`custom-node ${selected ? 'selected' : ''}`}
            style={{
                background: data.bgColor || '#FFFFFF',
                color: data.color || '#000000',
                fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
                borderColor: selected ? '#4096ff' : '#ddd',
                padding: '10px 16px',
                borderRadius: '8px',
                minWidth: '160px',
                minHeight: '40px'
            }}
        >
            {/* TARGET handle'lar (4 yön) - Only visible on hover */}
            <Handle id="targetLeft"   type="target" position={Position.Left}   isConnectable={isConnectable} className="node-handle" />
            <Handle id="targetRight"  type="target" position={Position.Right}  isConnectable={isConnectable} className="node-handle" />
            <Handle id="targetTop"    type="target" position={Position.Top}    isConnectable={isConnectable} className="node-handle" />
            <Handle id="targetBottom" type="target" position={Position.Bottom} isConnectable={isConnectable} className="node-handle" />

            {/* İçerik */}
            <div className="html-content" dangerouslySetInnerHTML={{ __html: data.label }} />

            {/* SOURCE handle'lar (4 yön) - Only visible on hover */}
            <Handle id="sourceLeft"   type="source" position={Position.Left}   isConnectable={isConnectable} className="node-handle" />
            <Handle id="sourceRight"  type="source" position={Position.Right}  isConnectable={isConnectable} className="node-handle" />
            <Handle id="sourceTop"    type="source" position={Position.Top}    isConnectable={isConnectable} className="node-handle" />
            <Handle id="sourceBottom" type="source" position={Position.Bottom} isConnectable={isConnectable} className="node-handle" />
        </div>
    );
});

export default CustomNode;
