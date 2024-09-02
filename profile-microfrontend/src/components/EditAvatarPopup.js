import React from 'react';
import PopupWithForm from './PopupWithForm';
import api from "../utils/api";


function EditAvatarPopup({ inputRef }) {
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);

  const handleChangeAvatarProfilePopupStatus = event => {
    setIsEditAvatarPopupOpen(event.detail)
  }

  const handleClose = event => {
    setIsEditAvatarPopupOpen(false)
  }

  function handleUpdateAvatar(avatarUpdate) {
    api
      .setUserAvatar(avatarUpdate)
      .then((newUserData) => {
        dispatchEvent(new CustomEvent("updateUser", {
          detail: newUserData
        }))
      })
      .catch((err) => console.log(err));
  }

  React.useEffect(() => {
    addEventListener("changeEditAvatarPopupStatus", handleChangeAvatarProfilePopupStatus);
    return () => removeEventListener("changeEditAvatarPopupStatus", handleChangeAvatarProfilePopupStatus)
  }, []);
  
  React.useEffect(() => {
    addEventListener("close", handleClose);
    return () => removeEventListener("close", handleClose)
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    handleUpdateAvatar({
      avatar: inputRef.current.value,
    });
  }

  return (
    <PopupWithForm
      isOpen={isEditAvatarPopupOpen} onSubmit={handleSubmit} title="Обновить аватар" name="edit-avatar"
    >

      <label className="popup__label">
        <input type="url" name="avatar" id="owner-avatar"
               className="popup__input popup__input_type_description" placeholder="Ссылка на изображение"
               required ref={inputRef} />
        <span className="popup__error" id="owner-avatar-error"></span>
      </label>
    </PopupWithForm>
  );
}

export default EditAvatarPopup;
