import React, { useEffect } from 'react';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import accountService from '../../services/api/account';
import { GoogleLoginResponse } from '../../types/account';

const GoogleCallback: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Foramind | " + t("Authenticating");
    
    const handleGoogleCallback = async () => {
      try {
        // URL hash'den token'ı al
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');
        
        if (token) {
          localStorage.setItem("gt", token); // Geçici olarak token'ı sakla
          
          const response = await accountService.googleLogin(token);
          const data = response.data as GoogleLoginResponse;
          
          if (data && data.result) {
            if (data.token) {
              localStorage.setItem("token", data.token);
              localStorage.setItem("refreshToken", data.refreshToken || '');
              
              if (data.isShowTrialDayPopup) {
                localStorage.setItem("isShowPopupForTrialDay", String(data.isShowTrialDayPopup));
              }
              
              if (data.statusCode) {
                localStorage.setItem("a1Num", data.statusCode);
              }
              
              if (data.freeDays) {
                localStorage.setItem("ab0c5", String(data.freeDays));
              }
              
              if (data.productId) {
                localStorage.setItem("hw8w0", String(data.productId));
              }
              
              if (data.productDay) {
                localStorage.setItem("bhr05", String(data.productDay));
              }
              
              if (data.trialDay) {
                localStorage.setItem("zt931", String(data.trialDay));
              }
              
              if (data.remainingProductDays) {
                localStorage.setItem("x8s88", String(data.remainingProductDays));
              }
              
              if (data.companySubscriptionInfo) {
                localStorage.setItem("c65s1", JSON.stringify(data.companySubscriptionInfo));
              }
              
              if (data.roleIdList) {
                localStorage.setItem("userRoleIdList", JSON.stringify(data.roleIdList));
              }
              
              if (data.email) {
                localStorage.setItem("googleEmail", data.email);
                localStorage.setItem("userMail", data.email);
              }
              
              navigate('/');
            } else {
              navigate('/login');
            }
          } else {
            navigate('/login');
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Google login error:', error);
        navigate('/login');
      }
    };

    handleGoogleCallback();
  }, [t, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" tip={t("Authenticating")} />
    </div>
  );
};

export default GoogleCallback; 