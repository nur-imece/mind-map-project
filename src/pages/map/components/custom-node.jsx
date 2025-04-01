import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './custom-node.scss';

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
      {/* Only show handles when selected */}
      {selected && (
        <>
          <Handle id="targetLeft" type="target" position={Position.Left} isConnectable={isConnectable} style={{ opacity: 0.5 }} />
          <Handle id="targetRight" type="target" position={Position.Right} isConnectable={isConnectable} style={{ opacity: 0.5 }} />
          <Handle id="targetTop" type="target" position={Position.Top} isConnectable={isConnectable} style={{ opacity: 0.5 }} />
          <Handle id="targetBottom" type="target" position={Position.Bottom} isConnectable={isConnectable} style={{ opacity: 0.5 }} />
        </>
      )}

      {/* İçerik */}
      <div className="html-content" dangerouslySetInnerHTML={{ __html: data.label }} />

      {/* Only show handles when selected */}
      {selected && (
        <>
          <Handle id="sourceLeft" type="source" position={Position.Left} isConnectable={isConnectable} style={{ opacity: 0.5 }} />
          <Handle id="sourceRight" type="source" position={Position.Right} isConnectable={isConnectable} style={{ opacity: 0.5 }} />
          <Handle id="sourceTop" type="source" position={Position.Top} isConnectable={isConnectable} style={{ opacity: 0.5 }} />
          <Handle id="sourceBottom" type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ opacity: 0.5 }} />
        </>
      )}
    </div>
  );
});

export default CustomNode; 