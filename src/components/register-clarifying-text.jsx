import { useTranslation } from "react-i18next";

function ClarifyingText() {
  const { t } = useTranslation();
  return t("RegisterClarifyingText");
}

export default ClarifyingText;
