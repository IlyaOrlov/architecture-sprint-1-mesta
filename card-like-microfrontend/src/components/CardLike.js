import React from 'react';
import api from "../utils/api";

import '../styles/card/card.css';


function CardLike({ currentUserId, card }) {

  function handleLikeClick() {
    const isLiked = card.likes.some((i) => i._id === currentUserId);
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        dispatchEvent(new CustomEvent("cardLike", {
          detail: {cardId: card._id, newCard: newCard}
        }))
      })
      .catch((err) => console.log(err));
  }

  const isLiked = card.likes.some(i => i._id === currentUserId);
  const cardLikeButtonClassName = `card__like-button ${isLiked && 'card__like-button_is-active'}`;

  return (
    <div className="card__likes">
      <button type="button" className={cardLikeButtonClassName} onClick={handleLikeClick}></button>
      <p className="card__like-count">{card.likes.length}</p>
    </div>
  );
}

export default CardLike;
