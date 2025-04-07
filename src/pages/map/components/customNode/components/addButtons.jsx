import React from 'react';
import { Button, Dropdown } from 'antd';
import { PlusOutlined, PictureOutlined, FontSizeOutlined, BranchesOutlined, EditOutlined } from '@ant-design/icons';

/**
 * Sol/sağ taraftaki + butonu ve dropdown menüsü.
 */
const AddButtons = ({
    side,
    visibleDropdown,
    setVisibleDropdown,
    handleAddClick,
    handleOptionClick,
    handleEditClick,
    selected
}) => {

    const iconStyle = {
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    // Dropdown item'ları
    const dropdownItems = [
        {
            key: 'text',
            label: <FontSizeOutlined style={iconStyle} />,
            onClick: () => handleOptionClick('text', side)
        },
        {
            key: 'node',
            label: <BranchesOutlined style={iconStyle} />,
            onClick: () => handleOptionClick('node', side)
        },
        {
            key: 'image',
            label: <PictureOutlined style={iconStyle} />,
            onClick: () => handleOptionClick('image', side)
        },
    ];

    const dropdownProps = {
        menu: { items: dropdownItems },
        trigger: ['click'],
        overlayStyle: {
            background: 'transparent',
            boxShadow: 'none',
            minWidth: 'auto',
            padding: 0
        },
        overlayClassName: 'custom-node-dropdown-menu',
        dropdownRender: (menu) => (
            <div style={{
                background: 'transparent',
                boxShadow: 'none',
                minWidth: 'auto',
                borderRadius: '50%'
            }}>
                {React.cloneElement(menu, {
                    style: {
                        background: 'transparent',
                        boxShadow: 'none',
                        padding: 0,
                        borderRadius: '8px'
                    }
                })}
            </div>
        )
    };

    // Buton yerleşim stilleri
    const containerStyle = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1000,
        pointerEvents: 'all'
    };

    if (side === 'left') {
        containerStyle.left = '-24px';
    } else if (side === 'right') {
        containerStyle.right = '-24px';
    }
    
    // Edit butonu için stil
    const editButtonStyle = {
        position: 'absolute',
        bottom: '-30px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        pointerEvents: 'all'
    };

    return (
        <>
            <div style={containerStyle}>
                <Dropdown
                    {...dropdownProps}
                    placement={side === 'left' ? 'leftTop' : 'rightTop'}
                    open={visibleDropdown === side}
                    onOpenChange={(open) => !open && setVisibleDropdown(null)}
                    className="custom-node-dropdown"
                >
                    <Button
                        type="primary"
                        shape="circle"
                        size="small"
                        style={{
                            backgroundColor: '#52c41a',
                            borderColor: '#52c41a',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                            zIndex: 1000,
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        icon={<PlusOutlined style={{ fontSize: '12px' }} />}
                        onClick={() => handleAddClick(side)}
                    />
                </Dropdown>
            </div>
            
            {/* Edit butonu - Sadece right side için göster */}
            {side === 'right' && (
                <div style={editButtonStyle}>
                    <Button
                        type="primary"
                        shape="circle"
                        size="small"
                        style={{
                            backgroundColor: '#1890ff',
                            borderColor: '#1890ff',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                            zIndex: 1000,
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        icon={<EditOutlined style={{ fontSize: '12px' }} />}
                        onClick={handleEditClick}
                    />
                </div>
            )}
        </>
    );
};

export default AddButtons;
