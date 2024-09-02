import React, {lazy, Suspense} from "react";
import { Route, useHistory, Switch } from "react-router-dom";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import api from "../utils/api";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import InfoTooltip from "./InfoTooltip";
import ProtectedRoute from "./ProtectedRoute";
import * as auth from "../utils/auth.js";


const Login = lazy(() => import('auth/Login').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
})
);

const Register = lazy(() => import('auth/Register').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
})
);

const EditProfilePopup = lazy(() => import('profile/EditProfilePopup').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
})
);

const EditAvatarPopup = lazy(() => import('profile/EditAvatarPopup').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
})
);

const AddPlacePopup = lazy(() => import('card_add/AddPlacePopup').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
})
);

function App() {
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [cards, setCards] = React.useState([]);

  // В корневом компоненте App создана стейт-переменная currentUser. Она используется в качестве значения для провайдера контекста.
  const [currentUser, setCurrentUser] = React.useState({});

  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = React.useState(false);
  const [tooltipStatus, setTooltipStatus] = React.useState("");

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  //В компоненты добавлены новые стейт-переменные: email — в компонент App
  const [email, setEmail] = React.useState("");

  const history = useHistory();

  const handleLogin = event => {
    if (event.detail) {
      localStorage.setItem('jwt', event.detail.token)
      setIsLoggedIn(true);
      setEmail(event.detail.email);
      history.push("/");
    }
    else {
      setTooltipStatus("fail");
      setIsInfoToolTipOpen(true);
    }
  }

  const handleRegister = event => {
    if (event.detail) {
      setTooltipStatus("success");
      setIsInfoToolTipOpen(true);
      history.push("/signin");
    }
    else {
      setTooltipStatus("fail");
      setIsInfoToolTipOpen(true);
    }
  }

  const handleUpdateUser = event => {
    setCurrentUser(event.detail);
    closeAllPopups();
  }

  const handleAddPlace = event => {
    setCards(cards => ([event.detail, ...cards]));
    closeAllPopups();
  }

  // Запрос к API за информацией о пользователе и массиве карточек выполняется единожды, при монтировании.
  React.useEffect(() => {
    api
      .getAppInfo()
      .then(([cardData, userData]) => {
        setCurrentUser(userData);
        setCards(cardData);
      })
      .catch((err) => console.log(err));
  }, []);

  // при монтировании App описан эффект, проверяющий наличие токена и его валидности
  React.useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      auth
        .checkToken(token)
        .then((res) => {
          setEmail(res.data.email);
          setIsLoggedIn(true);
          history.push("/");
        })
        .catch((err) => {
          localStorage.removeItem("jwt");
          console.log(err);
        });
    }
  }, [history]);

  React.useEffect(() => {
    addEventListener("login", handleLogin);
    return () => removeEventListener("login", handleLogin)
  }, []);

  React.useEffect(() => {
    addEventListener("register", handleRegister);
    return () => removeEventListener("register", handleRegister)
  }, []);

  React.useEffect(() => {
    addEventListener("updateUser", handleUpdateUser);
    return () => removeEventListener("updateUser", handleUpdateUser)
  }, []);

  React.useEffect(() => {
    addEventListener("addPlace", handleAddPlace);
    return () => removeEventListener("addPlace", handleAddPlace)
  }, []);

  function handleEditProfileClick() {
    dispatchEvent(new CustomEvent("changeEditProfilePopupStatus", { detail: true }));
  }

  function handleEditAvatarClick() {
    dispatchEvent(new CustomEvent("changeEditAvatarPopupStatus", { detail: true }));
  }

  function handleAddPlaceClick() {
    dispatchEvent(new CustomEvent("changeAddPlacePopupStatus", { detail: true }));
  }

  function closeAllPopups() {
    dispatchEvent(new CustomEvent("changeEditProfilePopupStatus", { detail: false }));
    dispatchEvent(new CustomEvent("changeAddPlacePopupStatus", { detail: false }));
    dispatchEvent(new CustomEvent("changeEditAvatarPopupStatus", { detail: false }));
    setIsInfoToolTipOpen(false);
    setSelectedCard(null);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((cards) =>
          cards.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((err) => console.log(err));
  }

  function handleCardDelete(card) {
    api
      .removeCard(card._id)
      .then(() => {
        setCards((cards) => cards.filter((c) => c._id !== card._id));
      })
      .catch((err) => console.log(err));
  }

  function onSignOut() {
    // при вызове обработчика onSignOut происходит удаление jwt
    localStorage.removeItem("jwt");
    setIsLoggedIn(false);
    // После успешного вызова обработчика onSignOut происходит редирект на /signin
    history.push("/signin");
  }

  return (
    // В компонент App внедрён контекст через CurrentUserContext.Provider
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page__content">
        <Header email={email} onSignOut={onSignOut} />
        <Switch>
          {/*Роут / защищён HOC-компонентом ProtectedRoute*/}
          <ProtectedRoute
            exact
            path="/"
            component={Main}
            cards={cards}
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            onEditAvatar={handleEditAvatarClick}
            onCardClick={handleCardClick}
            onCardLike={handleCardLike}
            onCardDelete={handleCardDelete}
            loggedIn={isLoggedIn}
          />
          {/*Роут /signup и /signin не является защищёнными, т.е оборачивать их в HOC ProtectedRoute не нужно.*/}
          <Route path="/signup">
            <Suspense>
              <Register />
            </Suspense>
          </Route>
          <Route path="/signin">
            <Suspense>
              <Login />
            </Suspense>
          </Route>
        </Switch>
        <Footer />
        <Suspense>
          <EditProfilePopup
            currentUser={currentUser}
          />
        </Suspense>
        <Suspense>
          <AddPlacePopup />
        </Suspense>
        <PopupWithForm title="Вы уверены?" name="remove-card" buttonText="Да" />
        <Suspense>
          <EditAvatarPopup
            inputRef={React.useRef()}
          />
        </Suspense>
        <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        <InfoTooltip
          isOpen={isInfoToolTipOpen}
          onClose={closeAllPopups}
          status={tooltipStatus}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
