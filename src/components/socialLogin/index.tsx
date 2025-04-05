import React from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import accountService from '../../services/api/account';
import googleBtnImage from '../../styles/img/google-btn-image.png';
import microsoftBtnImage from '../../styles/img/microsoft-btn.svg';
import './index.scss';

type SocialLoginProps = {
  onLoginSuccess?: () => void;
};

const SocialLogin: React.FC<SocialLoginProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      window.location.href = `https://accounts.google.com/o/oauth2/auth?client_id=545262035465-o6771i0sk22ncm48o0pumkbrlc48ml1f.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(window.location.origin + '/google-callback')}&response_type=token&scope=email profile`;
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  // Handle Microsoft login
  const handleMicrosoftLogin = async () => {
    try {
      const tenantId = "common"; // Microsoft'un common tenant'ı genel kullanıcılar için
      const clientId = "ad04bed9-faa7-44f4-93b3-55c72c8b9411"; // Microsoft application client ID
      const redirectUri = encodeURIComponent(window.location.origin + '/microsoft-callback');
      const responseType = "code"; // Authorization code flow için "code" kullanılır
      const scopes = encodeURIComponent("openid profile email api://ad04bed9-faa7-44f4-93b3-55c72c8b9411/foramind-login");
      
      const microsoftAuthUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&scope=${scopes}&response_mode=query`;
      
      window.location.href = microsoftAuthUrl;
    } catch (error) {
      console.error("Microsoft login error:", error);
    }
  };

  return (
    <div className="social-login-buttons">
      <Button
        type="default"
        block
        className="google-login"
        icon={<img src={googleBtnImage} alt="Google" className="social-icon" />}
        onClick={handleGoogleLogin}
      >
        {t("googleLoginMsgTxt")}
      </Button>

      <Button
        type="default"
        block
        className="microsoft-login"
        icon={<img src={microsoftBtnImage} alt="Microsoft" className="social-icon" />}
        onClick={handleMicrosoftLogin}
      >
        {t("azureLoginMsgTxt")}
      </Button>
    </div>
  );
};

export default SocialLogin; 