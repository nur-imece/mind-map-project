import React, { useContext } from 'react';
import { Select, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/languageContext';
import './languageSelector.css';

const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();
    const { selectedLanguage, setSelectedLanguage } = useContext(LanguageContext);

    const handleLanguageChange = (value: string) => {
        setSelectedLanguage(value);
        i18n.changeLanguage(value);
    };

    const languageOptions = [
        { value: 'tr', label: 'Türkçe' },
        { value: 'en', label: 'English' }
    ];

    return (
        <div className="language-selector">
            <Select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                bordered={false}
                dropdownStyle={{ minWidth: '120px' }}
                popupClassName="language-dropdown"
                size="middle"
                placement="bottomLeft"
                getPopupContainer={triggerNode => triggerNode.parentNode}
                dropdownAlign={{ offset: [0, 4] }}
                style={{ display: 'flex', alignItems: 'center' }}
                showArrow={true}
            >
                {languageOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <Typography.Text strong>{option.label}</Typography.Text>
                        </span>
                    </Select.Option>
                ))}
            </Select>
        </div>
    );
};

export default LanguageSelector; 