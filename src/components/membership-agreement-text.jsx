import { useTranslation } from "react-i18next";

function MembershipAgreementText() {
  const { t } = useTranslation();
  return t("MembershipAgreementText");
}

export default MembershipAgreementText;
