import React from 'react';
import { Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import silverBadgeImg from "../../../../styles/img/free-badge.png";
import goldBadgeImg from "../../../../styles/img/gold-badge.png";

const packageCards = ({ 
  selectedPackageParam, 
  couponCode, 
  handleCouponCodeChange, 
  useCouponCode 
}) => {
  const { t } = useTranslation();

  return (
    <div className="row">
      <div className="col-md-11">
        <div className="cards-wrap">
          <div className={`card month-card${selectedPackageParam === 'monthly' ? ' activate' : ''}`}>
            <div className="card-body">
              <div className="title-wrap">
                <div className="card-title">
                  {t('paymentPageMothlyTitleMsgTxt')}
                </div>
                <img
                  src={silverBadgeImg}
                  alt={t('paymentPageMothlyInfoTextMsgTxt')}
                />
              </div>

              <div className="price">
                <span className="kdv-info">
                  ({t('kdvInfoForPackagesTextMsgTxt')})
                </span>

                <div className="price-area">
                  <span className="many-value" data-durationType="Monthly" data-productId="1" data-interval="month">100₺</span>
                </div>

                <div className="monthly-period">
                  {t('monthly')}
                  <div className="days-info">({t('30Days')})</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`card year-card${selectedPackageParam === 'yearly' ? ' activate' : ''}`}>
            <div className="card-body">
              <div className="title-wrap">
                <div className="card-title">
                  {t('paymentPageYearlyTitleMsgTxt')}
                </div>
                <img
                  src={goldBadgeImg}
                  alt={t('paymentPageYearlyInfoTextMsgTxt')}
                />
              </div>

              <div className="price">
                <span className="kdv-info">
                  ({t('kdvInfoForPackagesTextMsgTxt')})
                </span>

                <div className="price-area">
                  <span className="many-value" data-durationType="Yearly" data-productId="2" data-interval="year">800₺</span>
                </div>

                <div className="yearly-period">
                  {t('yearly')}
                </div>
              </div>
            </div>
          </div>

          <div className="coupon-input-area">
            <Input
              placeholder={t('couponCode')}
              onChange={(e) => handleCouponCodeChange(e.target.value)}
              value={couponCode}
              id="couponCode"
            />
            <Button
              type="primary"
              onClick={() => useCouponCode(couponCode)}
              className="use-code-btn"
            >
              {t('useCodeMsgTxt')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default packageCards; 