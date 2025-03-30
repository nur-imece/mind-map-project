import { useTranslation } from "react-i18next";

function ClarifyingText() {
  const { t } = useTranslation();
  return <div className="membership-agreement" dangerouslySetInnerHTML={{ __html: t("AccountContactClarifyingText") }} />;
}

export default ClarifyingText;
