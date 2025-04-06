import React, { useState, useEffect } from 'react';
import { Button, Tooltip, Modal, ColorPicker, Divider, Tabs, Row, Col, Slider, Input, InputNumber } from 'antd';
import { 
    EditOutlined,
    FontSizeOutlined, 
    BorderOuterOutlined, 
    BgColorsOutlined,
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    FontColorsOutlined,
    CloseOutlined,
    PictureOutlined,
    SmileOutlined,
    FormatPainterOutlined,
    FullscreenOutlined,
    CompressOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { NODE_SHAPES, FONT_FAMILIES } from './utils';

// Modern emojiler - daha güncel ve kategorize edilmiş
const EMOJI_CATEGORIES = {
    "Yüzler": [
        "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "😍", "🥰", "😘", "😗", "😚", "😙",
        "😋", "😛", "😜", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥"
    ],
    "Duygular": [
        "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎",
        "🤓", "🧐", "😕", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱"
    ],
    "Eller": [
        "👋", "🤚", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", 
        "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲"
    ],
    "Kalpler": [
        "❤️", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "💔", "❤️‍🔥", "❤️‍🩹", "💌", "💕", "💞", "💓", "💗", "💖",
        "💘", "💝", "💟", "♥️"
    ],
    "Hayvanlar": [
        "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", 
        "🙊", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌"
    ],
    "Yiyecekler": [
        "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑",
        "🌮", "🌯", "🥪", "🍕", "🍔", "🍟", "🍖", "🍗", "🥩", "🍱", "🥡", "🍿", "🧂", "🥓", "🍳", "🥞", "🧇", "🥐", "🍞"
    ],
    "Aktiviteler": [
        "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🥅", "⛳", "🪁", "🎮", "👾", "🎲", "🧩", 
        "♟️", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🪘", "🎷", "🎺", "🪗", "🎸", "🎻"
    ],
    "Objeler": [
        "⌚", "📱", "💻", "⌨️", "🖥️", "🖱️", "💽", "📀", "💿", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺",
        "📻", "🎙️", "🎚️", "🎛️", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "💡", "🔦", "🕯️", "🧯"
    ],
    "Semboller": [
        "💯", "✅", "❌", "❓", "❗", "❕", "❔", "‼️", "⁉️", "💬", "🗯️", "💭", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪",
        "🟤", "🔺", "🔻", "🔸", "🔹", "🔶", "🔷", "🔳", "🔲"
    ]
};

/**
 * Node düzenleme seçenekleri için düğmeler ve menüler.
 */
const NodeEditOptions = ({
    onFontChange,
    onShapeChange,
    onTextStyleChange,
    onColorChange,
    onBgImageChange,
    onAddEmoji,
    onSizeChange,
    selectedFontFamily,
    selectedShape,
    currentNodeSize,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState('1');
    const [emojiSearchText, setEmojiSearchText] = useState('');
    const [selectedEmojiCategory, setSelectedEmojiCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);

    // Şekiller bölümü
    const renderShapeOptions = () => (
        <div className="shape-options">
            {NODE_SHAPES.map((shape, index) => (
                <div 
                    key={index} 
                    className={`shape-item ${currentNodeSize && currentNodeSize.shape === shape.name ? 'active' : ''}`}
                    onClick={() => onShapeChange(shape)}
                >
                    <div 
                        className="shape-preview" 
                        style={{ 
                            borderRadius: shape.borderRadius,
                            ...(shape.customStyle || {})
                        }}
                    ></div>
                    <span>{shape.name}</span>
                </div>
            ))}
        </div>
    );

    // Font ailesi menüsü
    const fontFamilyContent = (
        <div className="font-list">
            {FONT_FAMILIES.map(font => (
                <div key={font.value} 
                    onClick={() => onFontChange(font.value)}
                    className={`font-item ${selectedFontFamily === font.value ? 'active' : ''}`}
                    style={{ fontFamily: font.value }}
                >
                    {font.name}
                </div>
            ))}
        </div>
    );

    // Metin stili düğmeleri
    const textStyleButtons = (
        <div className="text-style-buttons">
            <Button 
                type="text" 
                icon={<BoldOutlined />} 
                onClick={() => onTextStyleChange('bold')}
            />
            <Button 
                type="text" 
                icon={<ItalicOutlined />} 
                onClick={() => onTextStyleChange('italic')}
            />
            <Button 
                type="text" 
                icon={<UnderlineOutlined />} 
                onClick={() => onTextStyleChange('underline')}
            />
        </div>
    );

    // Boyut ayarlama bölümü
    const sizeAdjustContent = (
        <div className="size-adjust-content">
            <div className="size-section">
                <div className="section-header">Genişlik</div>
                <Row align="middle" gutter={8}>
                    <Col span={16}>
                        <Slider 
                            min={80} 
                            max={400} 
                            value={typeof currentNodeSize?.width === 'number' ? currentNodeSize.width : 160} 
                            onChange={(value) => onSizeChange('width', value)}
                        />
                    </Col>
                    <Col span={8}>
                        <InputNumber
                            min={80}
                            max={400}
                            value={typeof currentNodeSize?.width === 'number' ? currentNodeSize.width : 160}
                            onChange={(value) => onSizeChange('width', value)}
                            style={{ width: '100%' }}
                        />
                    </Col>
                </Row>
            </div>
            
            <div className="size-section">
                <div className="section-header">Yükseklik</div>
                <Row align="middle" gutter={8}>
                    <Col span={16}>
                        <Slider 
                            min={40} 
                            max={300} 
                            value={typeof currentNodeSize?.height === 'number' ? currentNodeSize.height : 40} 
                            onChange={(value) => onSizeChange('height', value)}
                        />
                    </Col>
                    <Col span={8}>
                        <InputNumber
                            min={40}
                            max={300}
                            value={typeof currentNodeSize?.height === 'number' ? currentNodeSize.height : 40}
                            onChange={(value) => onSizeChange('height', value)}
                            style={{ width: '100%' }}
                        />
                    </Col>
                </Row>
            </div>
            
            <div className="size-controls">
                <Button 
                    icon={<CompressOutlined />} 
                    onClick={() => onSizeChange('reset')}
                >
                    Sıfırla
                </Button>
                <Button 
                    type="primary" 
                    icon={<FullscreenOutlined />}
                    onClick={() => onSizeChange('auto')}
                >
                    İçeriğe Göre Ayarla
                </Button>
            </div>
        </div>
    );

    // Emoji seçim bölümü
    const filteredEmojis = !emojiSearchText 
        ? EMOJI_CATEGORIES[selectedEmojiCategory]
        : Object.values(EMOJI_CATEGORIES).flat().filter(emoji => 
            emoji.includes(emojiSearchText)
        );

    const emojiCategoryButtons = (
        <div className="emoji-categories">
            {Object.keys(EMOJI_CATEGORIES).map(category => (
                <Button
                    key={category}
                    type={selectedEmojiCategory === category ? "primary" : "default"}
                    size="small"
                    onClick={() => setSelectedEmojiCategory(category)}
                    className="category-button"
                >
                    {category}
                </Button>
            ))}
        </div>
    );

    const emojiSelectContent = (
        <div className="emoji-select-content">
            <Input
                placeholder="Emoji ara..."
                value={emojiSearchText}
                onChange={(e) => setEmojiSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
            />
            
            {!emojiSearchText && emojiCategoryButtons}
            
            <div className="emoji-grid">
                {filteredEmojis.map((emoji, index) => (
                    <div
                        key={index}
                        className="emoji-item"
                        onClick={() => onAddEmoji && onAddEmoji(emoji)}
                    >
                        {emoji}
                    </div>
                ))}
            </div>
        </div>
    );

    // Ana içerik - Tabs ile organize edilmiş
    const tabItems = [
        {
            key: '1',
            label: 'Şekil ve Stil',
            children: (
                <div className="tab-content">
                    <div className="section">
                        <div className="section-header">Şekil</div>
                        {renderShapeOptions()}
                    </div>
                    
                    <Divider />
                    
                    <div className="section">
                        <div className="section-header">Renkler</div>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <div className="color-label">Yazı Rengi</div>
                                <ColorPicker
                                    allowClear
                                    showText={false}
                                    onChange={(color) => onColorChange && onColorChange('textColor', color.toHexString())}
                                />
                            </Col>
                            <Col span={12}>
                                <div className="color-label">Arkaplan</div>
                                <ColorPicker
                                    allowClear
                                    showText={false}
                                    onChange={(color) => onColorChange && onColorChange('bgColor', color.toHexString())}
                                />
                            </Col>
                        </Row>
                    </div>
                    
                    <Divider />
                    
                    <div className="section">
                        <div className="section-header">Yazı Stili</div>
                        {textStyleButtons}
                    </div>
                </div>
            ),
        },
        {
            key: '2',
            label: 'Yazı Tipi',
            children: (
                <div className="tab-content">
                    <div className="section-header">Yazı Tipi Seçimi</div>
                    {fontFamilyContent}
                </div>
            ),
        },
        {
            key: '3',
            label: 'Boyut',
            children: sizeAdjustContent,
        },
        {
            key: '4',
            label: 'Emojiler',
            children: emojiSelectContent,
        }
    ];

    return (
        <Modal
            title="Düzenleme Seçenekleri"
            open={true}
            onCancel={onClose}
            footer={null}
            width={380}
            className="node-edit-modal"
            destroyOnClose
            maskClosable={true}
            centered
        >
            <Tabs
                defaultActiveKey="1"
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                type="card"
                className="edit-tabs"
            />
        </Modal>
    );
};

export default NodeEditOptions; 