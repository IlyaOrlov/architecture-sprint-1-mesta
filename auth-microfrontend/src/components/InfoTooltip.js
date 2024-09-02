import React from 'react';
import SuccessIcon from '../images/success-icon.svg';
import ErrorIcon from '../images/error-icon.svg';

import '../styles/popup/popup.css';
import '../styles/popup/_is-opened/popup_is-opened.css';


function InfoTooltip() {
  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = React.useState(false);
  const [tooltipStatus, setTooltipStatus] = React.useState("");

  const icon = tooltipStatus === 'success' ? SuccessIcon : ErrorIcon
  const text = tooltipStatus === 'success' ? "Вы успешно зарегистрировались" : 
     "Что-то пошло не так! Попробуйте ещё раз."

  const handleChangeInfoToolTipStatus = event => {
    setIsInfoToolTipOpen(event.detail)
  }
  
  function onClose() {
    dispatchEvent(new CustomEvent("close", {}))
  }

  React.useEffect(() => {
    addEventListener("changeInfoToolTipStatus", handleChangeInfoToolTipStatus);
    return () => removeEventListener("changeInfoToolTipStatus", handleChangeInfoToolTipStatus)
  }, []);
  
  React.useEffect(() => {
    addEventListener("close", handleClose);
    return () => removeEventListener("close", handleClose)
  }, []);
  
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

 