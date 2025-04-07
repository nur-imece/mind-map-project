import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Tooltip, message } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';

// _tiny ile biten resimler ve map-bg resimlerini doğrudan import edelim
import takeNoteTiny from '../../../styles/img/background-image.png';
import planlamaTiny from '../../../styles/img/background-image21_tiny.png';
import mapListBg01 from '../../../styles/img/map-list-bg-01.png';
import mapListBg02 from '../../../styles/img/map-list-bg-02.png';
import mapListBg03 from '../../../styles/img/map-list-bg-03.png';
import mapListBg04 from '../../../styles/img/map-list-bg-04.png';
import mapListBg05 from '../../../styles/img/map-list-bg-05.png';

/**
 * Harita arkaplan resmini değiştirme komponenti
 */
const BackgroundChanger = ({ onBackgroundChange, initialBackgroundName }) => {
    const [currentBackground, setCurrentBackground] = useState('');

    // Arkaplan resimleri için sabit liste oluşturalım
    const backgroundImages = [
        { path: takeNoteTiny, name: 'take-note_tiny' },
        { path: planlamaTiny, name: 'planlama_tiny' },
        { path: mapListBg01, name: 'map-list-bg-01' },
        { path: mapListBg02, name: 'map-list-bg-02' },
        { path: mapListBg03, name: 'map-list-bg-03' },
        { path: mapListBg04, name: 'map-list-bg-04' },
        { path: mapListBg05, name: 'map-list-bg-05' }
    ];

    // Find background path by name
    const getBackgroundPathByName = (bgName) => {
        const bg = backgroundImages.find(bg => bg.name === bgName);
        return bg ? bg.path : null;
    };

    // Set default background on component mount
    useEffect(() => {
        if (initialBackgroundName) {
            const bgPath = getBackgroundPathByName(initialBackgroundName);
            if (bgPath) {
                applyBackground(bgPath, initialBackgroundName);
            }
        } else {
            // Set default background to take-note_tiny
            const defaultBg = backgroundImages.find(bg => bg.name === 'take-note_tiny');
            if (defaultBg) {
                applyBackground(defaultBg.path, defaultBg.name);
            }
        }
    }, [initialBackgroundName]);

    // Apply background CSS
    const applyBackground = (bgPath, bgName) => {
        const container = document.querySelector('.mind-map-page');
        if (container) {
            container.style.background = `#f2f2f2 url(${bgPath}) no-repeat`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = 'center';
            setCurrentBackground(bgName);
        }
    };

    // Arkaplan görüntüsünü değiştirme fonksiyonu
    const changeBackground = (bgPath, bgName) => {
        applyBackground(bgPath, bgName);
        if (onBackgroundChange) {
            onBackgroundChange(bgName);
        }
        message.success(`Arkaplan "${bgName}" olarak değiştirildi`);
    };

    // Arkaplanı sıfırlama fonksiyonu
    const resetBackground = () => {
        const container = document.querySelector('.mind-map-page');
        if (container) {
            container.style.backgroundImage = 'none';
            container.style.backgroundSize = 'initial';
            container.style.backgroundPosition = 'initial';
            container.style.backgroundRepeat = 'initial';
            setCurrentBackground('');
            if (onBackgroundChange) {
                onBackgroundChange('');
            }
            message.success('Arkaplan sıfırlandı');
        }
    };

    // Dropdown menü içeriği
    const items = [
        ...backgroundImages.map((bg, index) => ({
            key: index.toString(),
            label: (
                <div className="bg-preview" style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
                    <div 
                        style={{ 
                            width: '60px', 
                            height: '40px', 
                            backgroundImage: `url(${bg.path})`,
                            backgroundSize: 'cover',
                            marginRight: '10px',
                            borderRadius: '4px',
                            border: '1px solid #eee'
                        }} 
                    />
                    <span>{bg.name}</span>
                </div>
            ),
            onClick: () => changeBackground(bg.path, bg.name)
        })),
        {
            type: 'divider',
        },
        {
            key: 'reset',
            label: (
                <div style={{ padding: '8px', color: '#ff4d4f', fontWeight: 'bold' }}>
                    Arkaplanı Sıfırla
                </div>
            ),
            onClick: resetBackground
        }
    ];

    return (
        <div className="background-changer-container" style={{ position: 'absolute', top: '70px', right: '20px', left: 'auto', zIndex: 1000, pointerEvents: 'auto' }}>
            <Tooltip title="Arkaplan Değiştir" placement="left">
                <Dropdown 
                    menu={{ items }} 
                    trigger={['click']}
                    placement="bottomLeft"
                >
                    <Button 
                        type="primary" 
                        shape="circle" 
                        icon={<BgColorsOutlined />} 
                        size="large"
                        style={{
                            boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
                            backgroundColor: currentBackground ? '#52c41a' : '#1890ff',
                            borderColor: currentBackground ? '#52c41a' : '#1890ff'
                        }}
                    />
                </Dropdown>
            </Tooltip>
        </div>
    );
};

export default BackgroundChanger; 