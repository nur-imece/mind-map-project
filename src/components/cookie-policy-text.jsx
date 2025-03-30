import { useTranslation } from "react-i18next";

function CookiePolicyText() {
  const { t } = useTranslation();
  return t("CookiePolicyText");
}

export default CookiePolicyText;
