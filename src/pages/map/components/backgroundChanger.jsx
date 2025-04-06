import React, { useState } from 'react';
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
const BackgroundChanger = () => {
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

    // Arkaplan görüntüsünü değiştirme fonksiyonu
    const changeBackground = (bgPath, bgName) => {
        const container = document.querySelector('.react-flow__pane');
        if (container) {
            container.style.backgroundImage = `url(${bgPath})`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = 'center';
            container.style.backgroundRepeat = 'no-repeat';
            setCurrentBackground(bgName);
            message.success(`Arkaplan "${bgName}" olarak değiştirildi`);
        } else {
            message.error('Harita içeriği bulunamadı');
        }
    };

    // Arkaplanı sıfırlama fonksiyonu
    const resetBackground = () => {
        const container = document.querySelector('.react-flow__pane');
        if (container) {
            container.style.backgroundImage = 'none';
            container.style.backgroundSize = 'initial';
            container.style.backgroundPosition = 'initial';
            container.style.backgroundRepeat = 'initial';
            setCurrentBackground('');
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
        <div className="background-changer-container" style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 4 }}>
            <Tooltip title="Arkaplan Değiştir" placement="left">
                <Dropdown 
                    menu={{ items }} 
                    trigger={['click']}
                    placement="topRight"
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