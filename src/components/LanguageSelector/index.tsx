import React from 'react';
import { Select, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { LanguageContext } from '../../context/languageContext';
import britishFlag from '../../styles/img/icon-british-flag.svg';
import turkishFlag from '../../styles/img/icon-turkish-flag.svg';

const { Option } = Select;

const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();
    const { selectedLanguage, setSelectedLanguage } = useContext(LanguageContext);

    const handleLanguageChange = (value: string) => {
        setSelectedLanguage(value);
        i18n.changeLanguage(value);
    };

    return (
        <div className="language-selector">
            <Select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                suffixIcon={<GlobalOutlined />}
                style={{ width: 120 }}
                dropdownStyle={{ minWidth: '120px' }}
            >
                <Option value="tr">
                    <Space>
                        <img src={turkishFlag} alt="TR" style={{ width: '16px', height: '16px' }} />
                        Türkçe
                    </Space>
                </Option>
                <Option value="en">
                    <Space>
                        <img src={britishFlag} alt="EN" style={{ width: '16px', height: '16px' }} />
                        English
                    </Space>
                </Option>
            </Select>
        </div>
    );
};

export default LanguageSelector; 