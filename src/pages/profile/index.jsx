import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Form } from "antd";
import ProfileAvatar from "./components/profileAvatar";
import ProfileForm from "./components/profileForm";
import ProfileAgreements from "./components/profileAgreements";
import { applyPhoneNumberMask, handleRemoveImage, handleChangeAvatarImage, checkboxCheckControl } from "./components/profileUtils";
import { fetchProfileData, updateProfileData } from "./components/profileService";
import Header from "../../components/header";
import './index.scss';

const Profile = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [isCheckboxRequired, setIsCheckboxRequired] = useState(false);
	
	const [profileImage, setProfileImage] = useState({
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
	
	const [hasImage, setHasImage] = useState(false);
	const [avatarColor, setAvatarColor] = useState('00ceff');
	const [getUserInfos, setGetUserInfos] = useState({
		company: "",
		jobTitle: "",
		avatarImage: null
	});
	
	useEffect(() => {
		localStorage.setItem("retrieveUrl", window.location.pathname);
		applyPhoneNumberMask();
		getProfile();
	}, []);
	
	const getProfile = async () => {
		await fetchProfileData(t, setLoading, fillProfile);
	};
	
	const fillProfile = (userProfile) => {
		if (!userProfile || !userProfile.user) return;
		
		const { user } = userProfile;
		
		form.setFieldsValue({
			phoneNumber: user.phoneNumber,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			company: user.company,
			jobTitle: user.jobTitle
		});
		
		setGetUserInfos({
			company: user.company,
			jobTitle: user.jobTitle,
			avatarImage: user.avatarImagePath
		});
		
		if (user.avatarColorCode) {
			setAvatarColor(user.avatarColorCode);
		}
		
		setHasImage(user.hasProfileImage);
		
		localStorage.setItem('newUserProfileImage', user.avatarImagePath);
		localStorage.setItem('userHasImage', JSON.stringify(user.hasProfileImage));
	};
	
	const onRemoveImage = (e) => {
		handleRemoveImage(e, t, setProfileImage, setHasImage);
	};
	
	const onChangeAvatarImage = (file) => {
		return handleChangeAvatarImage(file, t, setLoading, setProfileImage, setHasImage);
	};
	
	const updateProfile = async () => {
		const formValues = form.getFieldsValue();
		
		const profileData = {
			firstName: formValues.firstName,
			lastName: formValues.lastName,
			company: formValues.company,
			jobTitle: formValues.jobTitle,
			phoneNumber: formValues.phoneNumber,
			email: formValues.email,
			avatarColorCode: avatarColor,
		};
		
		if (hasImage) {
			// Include avatar data if an image is uploaded
			profileData.avatarImage = profileImage.avatar;
		}
		
		await updateProfileData(
			profileData, 
			t, 
			setLoading, 
			setIsCheckboxRequired,
			getUserInfos,
			hasImage,
			profileImage
		);
	};
	
	const onCheckboxCheck = (e) => {
		checkboxCheckControl(e);
	};
	
	return (
		<>
			<Header />
			<div className="profile-page">
				<div className="profile-panel">
					<div className="profile-header">
						<h2>{t("profileMsgTxt")}</h2>
					</div>
					<Form form={form} layout="vertical">
						<ProfileAvatar
							hasImage={hasImage}
							profileImage={profileImage}
							loading={loading}
							avatarColor={avatarColor}
							firstNameLetter={form.getFieldValue("firstName")?.charAt(0) || ''}
							lastNameLetter={form.getFieldValue("lastName")?.charAt(0) || ''}
							handleRemoveImage={onRemoveImage}
							handleChangeAvatarImage={onChangeAvatarImage}
						/>
						
						<ProfileForm 
							form={form}
							loading={loading}
							updateProfile={updateProfile}
						/>
						
						<ProfileAgreements 
							isCheckboxRequired={isCheckboxRequired}
							checkboxCheckControl={onCheckboxCheck}
						/>
					</Form>
				</div>
			</div>
		</>
	);
};

export default Profile;
