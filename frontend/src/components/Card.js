import React, {lazy, Suspense} from "react";
import { CurrentUserContext } from '../contexts/CurrentUserContext';


const CardLike = lazy(() => import('card_like/CardLike').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
})
);

const CardDel = lazy(() => import('card_del/CardDel').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
})
);

function Card({ card, onCardClick }) {
  const cardStyle = { backgroundImage: `url(${card.link})` };

  function handleClick() {
    onCardClick(card);
  }

  const currentUser = React.useContext(CurrentUserContext);

  return (
    <li className="places__item card">
      <div className="card__image" style={cardStyle} onClick={handleClick}>
      </div>
      <Suspense>
          <CardDel
            cardId={card._id} 
            isOwn={card.owner._id === currentUser._id}
          />
        </Suspense>
      <div className="card__description">
        <h2 className="card__title">
          {card.name}
        </h2>
        <Suspense>
          <CardLike 
            currentUserId={currentUser._id}
            card={card}
          />
        </Suspense>
      </div>
    </li>
  );
}

export default Card;
