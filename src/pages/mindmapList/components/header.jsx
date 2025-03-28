import React from 'react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import ViewTypeSelector from './viewtypeselector';
import LanguageSelector from '../../../components/languageSelector';

const { Title } = Typography;

const Header = ({ viewType, setViewType }) => {
    const { t } = useTranslation();

    return (
        <div className="app-header">
            <div className="header-left">
                <Title level={4}>{t("mindMapsMsgTxt")}</Title>
            </div>
            <div className="header-right">
                <ViewTypeSelector viewType={viewType} setViewType={setViewType} />
                <LanguageSelector />
            </div>
        </div>
    );
};

export default Header; 