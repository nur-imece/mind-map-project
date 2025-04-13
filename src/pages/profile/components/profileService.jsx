import { message } from "antd";
import accountService from "../../../services/api/account";

export const fetchProfileData = async (t, setLoading, fillProfile) => {
  setLoading(true);
  try {
    const response = await accountService.getDetail();
    if (response.data) {
      fillProfile(response.data);
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    message.error(t("errorMsgTxt"));
  } finally {
    setLoading(false);
  }
};

export const updateProfileData = async (
  profileData, 
  t, 
  setLoading, 
  setIsCheckboxRequired,
  getUserInfos,
  hasImage,
  profileImage
) => {
  if (profileData.phoneNumber && profileData.phoneNumber.length > 0 && profileData.phoneNumber.length < 18) {
    message.error(t('wrongPhoneNumberMsgTxt'));
    return false;
  }
  
  if (
    (getUserInfos.company === profileData.company) &&
    (getUserInfos.jobTitle === profileData.jobTitle) &&
    (!hasImage || profileImage.avatar.file === '')
  ) {
    // No changes to company, jobTitle, or avatar
    try {
      setLoading(true);
      await accountService.updateDetail(profileData);
      message.success(t("successMsgTxt"));
    } catch (error) {
      message.error(t("errorMsgTxt"));
    } finally {
      setLoading(false);
    }
  } else {
    // Changes to company, jobTitle, or avatar
    setIsCheckboxRequired(true);
    
    const requiredErr = document.querySelector('.required-err');
    if (requiredErr) {
      requiredErr.classList.add('red');
      requiredErr.classList.remove('none');
    }
    
    const checkbox1 = document.querySelector("#checkbox1-clarify");
    const checkbox2 = document.querySelector("#checkbox2-explicit");
    
    if (checkbox1 && checkbox2 && checkbox1.checked && checkbox2.checked) {
      if (requiredErr) {
        requiredErr.classList.remove('red');
        requiredErr.classList.add('none');
      }
      
      try {
        setLoading(true);
        await accountService.updateDetail(profileData);
        message.success(t("successMsgTxt"));
      } catch (error) {
        message.error(t("errorMsgTxt"));
      } finally {
        setLoading(false);
      }
    } else {
      return false;
    }
  }
  setIsCheckboxRequired(false);
  return true;
}; 