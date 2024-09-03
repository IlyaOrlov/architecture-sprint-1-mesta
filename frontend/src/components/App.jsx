import React, {lazy, Suspense} from "react";
import { Route, useHistory, Switch } from "react-router-dom";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import api from "../utils/api";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
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

const InfoTooltip = lazy(() => import('auth/InfoTooltip').catch(() => {
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

const PopupWithForm = lazy(() => import('card_del/PopupWithForm').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
})
);

function App() {
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [cards, setCards] = React.useState([]);

  // В корневом компоненте App создана стейт-переменная currentUser. Она используется в качестве значения для провайдера контекста.
  const [currentUser, setCurrentUser] = React.useState({});

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
  }

  const handleRegister = event => {
    if (event.detail) {
      history.push("/signin");
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

  const handleCardLike = event => {
      setCards((cards) =>
        cards.map((c) => (c._id === event.detail.cardId ? event.detail.newCard : c))
      );
  }

  const handleCardDelete = event => {
      setCards((cards) => cards.filter((c) => c._id !== event.detail.cardId));
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

  React.useEffect(() => {
    addEventListener("cardLike", handleCardLike);
    return () => removeEventListener("cardLike", handleCardLike)
  }, []);

  React.useEffect(() => {
    addEventListener("cardDelete", handleCardDelete);
    return () => removeEventListener("cardDelete", handleCardDelete)
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
    dispatchEvent(new CustomEvent("close", {}));
    setSelectedCard(null);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
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
        <Suspense>
          <PopupWithForm title="Вы уверены?" name="remove-card" buttonText="Да" />
        </Suspense>  
        <Suspense>
          <EditAvatarPopup
            inputRef={React.useRef()}
          />
        </Suspense>
        <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        <Suspense>
          <InfoTooltip />
        </Suspense>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
