import { message, Modal } from "antd";
import Resizer from 'react-image-file-resizer';
import IMask from 'imask';

// Image related utility functions
export const handleRemoveImage = (e, t, setProfileImage, setHasImage) => {
  e && e.stopPropagation();
  
  Modal.confirm({
    title: t("removeProfileImageMsgTxt"),
    content: t("areyousureMsgTxt"),
    okText: t("yesMsgTxt"),
    cancelText: t("noMsgTxt"),
    onOk: async () => {
      setProfileImage({
        imagePreviewUrl: "",
        imagePreviewBase64Type: "",
        avatar: {
          name: "",
          extension: "",
          type: "",
          referenceId: "",
          referenceIdType: 0,
          file: ""
        }
      });
      setHasImage(false);
    }
  });
};

export const handleChangeAvatarImage = (file, t, setLoading, setProfileImage, setHasImage) => {
  const fileSizeLimit = 2048; // 2MB max size
  if (file.size < (fileSizeLimit * 1024)) {
    setLoading(true);
    Resizer.imageFileResizer(
      file,
      5000,
      5000,
      'jpeg',
      50,
      0,
      (blob) => {
        const optimizedFileObj = new File([blob], (new Date().getTime().toString()) + (Math.floor(Math.random() * 10000000000000000) + 1).toString(), { type: blob.type });
        const reader = new FileReader();
        reader.readAsDataURL(optimizedFileObj);
        reader.onload = () => {
          const image = reader.result.split(';base64,')[1];
          setProfileImage({
            imagePreviewUrl: reader.result,
            imagePreviewBase64Type: image,
            avatar: {
              name: optimizedFileObj.name,
              extension: 'jpg',
              type: optimizedFileObj.type,
              referenceId: "",
              referenceIdType: 0,
              file: image
            }
          });
          setHasImage(true);
          setLoading(false);
        };
      },
      'blob'
    );
  } else {
    message.error(t("imageFileSizeMsgTxt").replace('*_*_*', fileSizeLimit));
  }
  return false; // Prevent automatic upload
};

// Form related utilities
export const applyPhoneNumberMask = () => {
  const element = document.getElementById('phoneNumber');
  if (element) {
    IMask(element, {
      mask: '{+9\\0}(500)-000-00-00'
    });
  }
};

export const checkboxCheckControl = (e) => {
  if (e.target.checked) {
    const parentNode = e.target.closest('.agreement-wrapper');
    if (parentNode) {
      const requiredErr = document.querySelector(".required-err");
      if (requiredErr) {
        requiredErr.classList.remove('red');
        requiredErr.classList.add('none');
      }
    }
  }
}; 