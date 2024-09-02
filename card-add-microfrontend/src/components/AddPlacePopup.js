import React from 'react';
import PopupWithForm from './PopupWithForm';
import api from "../utils/api";


function AddPlacePopup() {
  const [name, setName] = React.useState('');
  const [link, setLink] = React.useState('');
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);

  const handleChangeAddPlacePopupStatus = event => {
    setIsAddPlacePopupOpen(event.detail)
  }

  const handleClose = event => {
    setIsAddPlacePopupOpen(false)
  }

  function handleAddPlaceSubmit(newCard) {
    api
      .addCard(newCard)
      .then((newCardFull) => {
        dispatchEvent(new CustomEvent("addPlace", {
          detail: newCardFull
        }))
      })
      .catch((err) => console.log(err));
  }

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleLinkChange(e) {
    setLink(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();

    handleAddPlaceSubmit({
      name,
      link
    });
  }

  React.useEffect(() => {
    addEventListener("changeAddPlacePopupStatus", handleChangeAddPlacePopupStatus);
    return () => removeEventListener("changeAddPlacePopupStatus", handleChangeAddPlacePopupStatus)
  }, []);
  
  React.useEffect(() => {
    addEventListener("close", handleClose);
    return () => removeEventListener("close", handleClose)
  }, []);


  return (
    <PopupWithForm
      isOpen={isAddPlacePopupOpen} onSubmit={handleSubmit} title="Новое место" name="new-card"
    >
      <label className="popup__label">
        <input type="text" name="name" id="place-name"
               className="popup__input popup__input_type_card-name" placeholder="Название"
               required minLength="1" maxLength="30" value={name} onChange={handleNameChange} />
        <span className="popup__error" id="place-name-error"></span>
      </label>
      <label className="popup__label">
        <input type="url" name="link" id="place-link"
               className="popup__input popup__input_type_url" placeholder="Ссылка на картинку"
               required value={link} onChange={handleLinkChange} />
        <span className="popup__error" id="place-link-error"></span>
      </label>
    </PopupWithForm>
  );
}

export default AddPlacePopup;
