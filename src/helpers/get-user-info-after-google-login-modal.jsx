import React, { Component } from "react";
import Resources from "../libraries/resources";
import LoginService from "../services/api/login";
import Utils from "../libraries/utils";

import checkInSquareIcon from "../styles/img/check-in-square-icon.png";


class GetUserInfoAfterGoogleLoginModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedUserTypeId: 1,
      branchName: null,
      studentClassVal: '-1',
      studentClassText: null,
      userTypeId: 1
    }
  }

  selectUserTypeHandleChange(e) {
    if (e.target.getAttribute('id') === 'teacher') {
      document.getElementById('teacherInfo').classList.contains('none') && document.getElementById('teacherInfo').classList.remove('none');
      !document.getElementById('studentInfo').classList.contains('none') && document.getElementById('studentInfo').classList.add('none');
      document.querySelectorAll('.form-check-input').forEach((item) => {
        item.classList.contains('active') && item.classList.remove('active');
      });
      e.target.classList.add('active');
      document.querySelector('#teacherInfo input').value = '';
      this.setState({
        selectedUserTypeId: parseInt(e.target.getAttribute('value')),
        branchName: document.querySelector('#teacherInfo input').value,
        userTypeId: parseInt(e.target.getAttribute('value')),
        studentClassVal: null,
        studentClassText: null
      })
    } else {
      document.getElementById('studentInfo').classList.contains('none') && document.getElementById('studentInfo').classList.remove('none');
      !document.getElementById('teacherInfo').classList.contains('none') && document.getElementById('teacherInfo').classList.add('none');
      document.querySelectorAll('.form-check-input').forEach((item) => {
        item.classList.contains('active') && item.classList.remove('active');
      });
      e.target.classList.add('active');
      this.setState({
        selectedUserTypeId: parseInt(e.target.getAttribute('value')),
        branchName: null,
        userTypeId: parseInt(e.target.getAttribute('value')),
        studentClassVal: this.state.studentClassVal,
        studentClassText: this.state.studentClassText
      })
    }
  }

  setTeacherBranch(e) {
    var branch = e.target.value;
    this.setState({
      branchName: branch
    });
  }

  onChangeStudentClass(e) {
    var index = e.nativeEvent.target.selectedIndex;
    this.setState({
      studentClassVal: e.target.value,
      studentClassText: e.nativeEvent.target[index].text
    });
  }

  warningModalFunc(messageText) {
    Utils.modalm().open({
      exitButtonText: Resources.getValue("exitMsgTxt"),
      title: Resources.getValue("warningSendMailMsgTxt"),
      bodyContent: messageText,
      buttons: [
        {
          text: Resources.getValue("okMsgTxt"),
          class: 'button yellow-button confirm-button',
          href: ''
        },
      ],
    });
  }

  updateInfos(e) {
    if (this.state.selectedUserTypeId === '') {
      // kullanici tipi secilmediyse
      this.warningModalFunc(Resources.getValue("youMustSelectUserTypeMsgTxt"));
    } else {
      if (this.state.selectedUserTypeId === 1) {
        if (document.querySelector('#teacherInfo input').value === "") {
          // ogretmen secili ama brans girilmediyse
          this.warningModalFunc(Resources.getValue("youMustWriteBranchForTeacherMsgTxt"));
        } else {
          this.setState({
            branchName: document.querySelector('#teacherInfo input').value,
            userTypeId: this.state.selectedUserTypeId,
            studentClassVal: null,
            studentClassText: null
          });
        }
      } else {
        if (this.state.studentClassVal === "-1" || this.state.studentClassVal === null) {
          // ogrenci secili ama sinif secilmediyse
          this.warningModalFunc(Resources.getValue("youMustSelectClassForStudentMsgTxt"));
        } else {
          this.setState({
            selectedUserTypeId: parseInt(e.target.getAttribute('value')),
            branchName: null,
            userTypeId: this.state.selectedUserTypeId,
            studentClassVal: this.state.studentClassVal,
            studentClassText: this.state.studentClassText
          })
        }
      }
    }

    var data = {
      branchName: this.state.branchName ? this.state.branchName : null,
      userTypeId: this.state.userTypeId,
      className: this.state.studentClassText ? this.state.studentClassText : null
    };

    LoginService.googleLoginUpdateUserType(data);
  }

  render() {

    return (
      <div className="overlay">
        <div className="popup get-info-for-google-login-modal">
          <div className="title">
            <span className="fa-stack fa-1x icon-wrap">
              <i className="fa fa-circle fa-stack-2x circle-icon"></i>
              <img src={checkInSquareIcon} alt="sitemap-icon" className="fa fa-circle fa-stack-2x sitemap-icon" />
            </span>
            <div className="text">
              Bilgi Alma {Resources.getValue("getInfosForGoogleLoginUserMsgTxt")}
            </div>
          </div>
          <div className="select-shared">
            <ul>
              <li className="buttons shared-select">
                <div className="email-tab-contents">
                  <div className="email-box active user-type-seect-wrapper">
                    <div className="mb-2 text-left info">
                      {Resources.getValue("selectUserTypeAndUpdateInfosMsgTxt")}
                    </div>
                    <div className="radio-wrapper">
                      {/* Ogretmen */}
                      <div className="form-check">
                        <input
                          className="form-check-input active"
                          type="radio"
                          name="userType"
                          id="teacher"
                          value="1"
                          onChange={(e) => this.selectUserTypeHandleChange(e)}
                        />
                        <label className="form-check-label" htmlFor="teacher">
                          <i className="icon-teacher"></i> <span>{Resources.getValue("teacherMsgTxt")}</span>
                        </label>
                      </div>
                      {/* Ogrenci */}
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="userType"
                          id="student"
                          value="2"
                          onChange={(e) => this.selectUserTypeHandleChange(e)}
                        />
                        <label className="form-check-label" htmlFor="student">
                          <i className="icon-people"></i> <span>{Resources.getValue("studentMsgTxt")}</span>
                        </label>
                      </div>
                      <div id="teacherInfo" className="teacher-info">
                        <input type="text" placeholder={Resources.getValue("branchNameMsgTxt")}
                          onChange={(e) => this.setTeacherBranch(e)} />
                      </div>
                      <select name="studentClass" id="studentInfo" className="student-info none"
                        onChange={(e) => { this.onChangeStudentClass(e) }}>
                        <option value="-1">{Resources.getValue("pleaseSelectClassMsgTxt")}</option>
                        <option value="1">İlköğretim 1. Sınıf</option>
                        <option value="2">İlköğretim 2. Sınıf</option>
                        <option value="3">İlköğretim 3. Sınıf</option>
                        <option value="4">İlköğretim 4. Sınıf</option>
                        <option value="5">İlköğretim 5. Sınıf</option>
                        <option value="6">İlköğretim 6. Sınıf</option>
                        <option value="7">İlköğretim 7. Sınıf</option>
                        <option value="8">İlköğretim 8. Sınıf</option>
                      </select>
                    </div>
                    <div className="mt-2 text-right">
                      <button
                        className="yellow-button button"
                        type="button"
                        title={Resources.getValue("updateInfosMsgTxt")}
                        onClick={(e) => this.updateInfos(e)}
                      >
                        {Resources.getValue("updateInfosMsgTxt")}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default GetUserInfoAfterGoogleLoginModal;
