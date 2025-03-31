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
                padding: '8px 12px',
                borderRadius: 6
            }}
        >
            {/* TARGET handle'lar (4 yön) */}
            <Handle id="targetLeft"   type="target" position={Position.Left}   isConnectable={isConnectable} />
            <Handle id="targetRight"  type="target" position={Position.Right}  isConnectable={isConnectable} />
            <Handle id="targetTop"    type="target" position={Position.Top}    isConnectable={isConnectable} />
            <Handle id="targetBottom" type="target" position={Position.Bottom} isConnectable={isConnectable} />

            {/* İçerik */}
            <div className="html-content" dangerouslySetInnerHTML={{ __html: data.label }} />

            {/* SOURCE handle'lar (4 yön) */}
            <Handle id="sourceLeft"   type="source" position={Position.Left}   isConnectable={isConnectable} />
            <Handle id="sourceRight"  type="source" position={Position.Right}  isConnectable={isConnectable} />
            <Handle id="sourceTop"    type="source" position={Position.Top}    isConnectable={isConnectable} />
            <Handle id="sourceBottom" type="source" position={Position.Bottom} isConnectable={isConnectable} />
        </div>
    );
});

export default CustomNode;
