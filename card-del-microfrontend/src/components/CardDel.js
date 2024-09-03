import React, {lazy, Suspense} from "react";
import api from "../utils/api";

import '../styles/card/card.css';


function CardDel({ cardId, isOwn }) {

  function handleDeleteClick() {
    api
      .removeCard(cardId)
      .then(() => {
        dispatchEvent(new CustomEvent("cardDelete", {
          detail: {cardId: cardId}
        }))
      })
      .catch((err) => console.log(err));
  }

  const cardDeleteButtonClassName = (
    `card__delete-button ${isOwn ? 'card__delete-button_visible' : 'card__delete-button_hidden'}`
  );

  return (
      <button type="button" className={cardDeleteButtonClassName} onClick={handleDeleteClick}></button>
  );
}

export default CardDel;
