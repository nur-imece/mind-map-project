import React from 'react';
import { Button, Dropdown } from 'antd';
import { PlusOutlined, PictureOutlined, FontSizeOutlined, BranchesOutlined } from '@ant-design/icons';

/**
 * Sol/sağ taraftaki + butonu ve dropdown menüsü.
 */
const AddButtons = ({
                        side,
                        visibleDropdown,
                        setVisibleDropdown,
                        handleAddClick,
                        handleOptionClick
                    }) => {

    const iconStyle = {
        fontSize: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    // Dropdown item’ları
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
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1000,
        pointerEvents: 'all'
    };

    if (side === 'left') {
        containerStyle.left = '-30px';
    } else if (side === 'right') {
        containerStyle.right = '-30px';
    }

    return (
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
                    size="large"
                    style={{
                        backgroundColor: '#52c41a',
                        borderColor: '#52c41a',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                        zIndex: 1000
                    }}
                    icon={<PlusOutlined />}
                    onClick={() => handleAddClick(side)}
                />
            </Dropdown>
        </div>
    );
};

export default AddButtons;
