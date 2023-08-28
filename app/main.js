import React, { useState, useReducer, useEffect } from "react";
import { useImmerReducer } from "use-immer";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";
import { CSSTransition } from "react-transition-group";

//components
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeGuest from "./components/HomeGuest";
import About from "./components/About";
import Terms from "./components/Terms";
import Home from "./components/Home";
import CreatePost from "./components/CreatePost";
import Axios from "axios";
import ViewSinglePost from "./components/ViewSinglePost";
import FlashMessage from "./components/FlashMessage";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
import Search from "./components/Search";

Axios.defaults.baseURL = "http://localhost:8080";

function Index() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("user")),
    flashMessages: [],
    user: {
      ...JSON.parse(localStorage.getItem("user")),
    },
    isSearchOpen: false,
  };

  //using immer allows to mutate state - immer takes care of the handling
  function ourReducer(draftState, action) {
    switch (action.type) {
      case "login":
        draftState.loggedIn = true;
        draftState.user = action.value;
        break;
      case "logout":
        draftState.loggedIn = false;
        draftState.user = {};
        break;
      case "flashMessage":
        draftState.flashMessages.push(action.value);
        break;
      case "triggerSearch":
        draftState.isSearchOpen = action.value;
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("user");
    }
  }, [state.loggedIn]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessage messages={state.flashMessages} />
          <Header />
          <Routes>
            <Route
              exact
              path="/"
              element={state.loggedIn ? <Home /> : <HomeGuest />}
            />
            <Route path="/profile/:username/*" element={<Profile />} />
            <Route path="/post/:id" element={<ViewSinglePost />} />
            <Route path="/post/:id/edit" element={<EditPost />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CSSTransition
            timeout={333}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <Search />
          </CSSTransition>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(<Index />);

if (module.hot) module.hot.accept();
