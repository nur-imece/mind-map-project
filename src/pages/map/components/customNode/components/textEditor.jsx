import React from 'react';
import { Input } from 'antd';

/**
 * Node üzerindeki metin düzenlemeleri için TextArea.
 */
const TextEditor = ({
                        value,
                        onChange,
                        onBlur,
                        onKeyDown,
                        fontSize,
                        color
                    }) => {
    return (
        <Input.TextArea
            autoSize
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            autoFocus
            className="no-border"
            style={{
                fontSize: fontSize ? `${fontSize}px` : '16px',
                color: color || '#000000',
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                width: '100%',
                resize: 'none'
            }}
        />
    );
};

export default TextEditor;
