import React from 'react';
import SuccessIcon from '../images/success-icon.svg';
import ErrorIcon from '../images/error-icon.svg';

import '../styles/popup/popup.css';
import '../styles/popup/_is-opened/popup_is-opened.css';


function InfoTooltip() {
  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = React.useState(false);
  const [tooltipStatus, setTooltipStatus] = React.useState("");

  const handleLogin = event => {
    if (!event.detail) {
      setTooltipStatus("fail");
      setIsInfoToolTipOpen(true);
    }
  }

  const handleRegister = event => {
    if (event.detail) {
      setTooltipStatus("success");
      setIsInfoToolTipOpen(true);
    }
    else {
      setTooltipStatus("fail");
      setIsInfoToolTipOpen(true);
    }
  }
  
  const handleClose = event => {
    setIsInfoToolTipOpen(false)
  }
  
  function onClose() {
    dispatchEvent(new CustomEvent("close", {}))
  }

  React.useEffect(() => {
    addEventListener("login", handleLogin);
    return () => removeEventListener("login", handleLogin)
  }, []);

  React.useEffect(() => {
    addEventListener("register", handleRegister);
    return () => removeEventListener("register", handleRegister)
  }, []);
  
  React.useEffect(() => {
    addEventListener("close", handleClose);
    return () => removeEventListener("close", handleClose)
  }, []);

  const icon = tooltipStatus === 'success' ? SuccessIcon : ErrorIcon
  const text = tooltipStatus === 'success' ? "Вы успешно зарегистрировались" : 
     "Что-то пошло не так! Попробуйте ещё раз."

  return (
    <div className={`popup ${isInfoToolTipOpen && 'popup_is-opened'}`}>
      <div className="popup__content">
        <form className="popup__form" noValidate>
          <button type="button" className="popup__close" onClick={onClose}></button>
            <div>
              <img className="popup__icon" src={icon} alt=""/>
              <p className="popup__status-message">{text}</p>
            </div>
        </form>
      </div>
    </div>
  );
}

export default InfoTooltip;

 