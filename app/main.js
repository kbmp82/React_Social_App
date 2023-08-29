import React, { useEffect, Suspense } from "react";
import { useImmerReducer } from "use-immer";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";
import { CSSTransition } from "react-transition-group";
import Axios from "axios";

//components
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeGuest from "./components/HomeGuest";
import About from "./components/About";
import Terms from "./components/Terms";
import Home from "./components/Home";
//lazy load example, wait until page is accessed to download component
const CreatePost = React.lazy(() => import("./components/CreatePost"));
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"));
import FlashMessage from "./components/FlashMessage";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
const Search = React.lazy(() => import("./components/Search"));
const Chat = React.lazy(() => import("./components/Chat"));
import Protected from "./components/ProtectedRoute";
import LoadingDotsIcon from "./components/LoadingDotsIcon";

Axios.defaults.baseURL = process.env.BACKENDURL || "";

function Index() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("user")),
    flashMessages: [],
    user: {
      ...JSON.parse(localStorage.getItem("user")),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
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
        redirect("/");
        break;
      case "flashMessage":
        draftState.flashMessages.push(action.value);
        break;
      case "triggerSearch":
        draftState.isSearchOpen = action.value;
        break;
      case "triggerChat":
        draftState.isChatOpen = action.value;
        break;
      case "incrementUnreadChatCount":
        draftState.unreadChatCount++;
        break;
      case "clearUnreadChatCount":
        draftState.unreadChatCount = 0;
        break;
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

  //check if token has expired on first render
  useEffect(() => {
    if (state.loggedIn) {
      const axiosRequest = Axios.CancelToken.source();
      try {
        (async () => {
          const res = await Axios.post(
            "/checkToken",
            { token: state.user.token },
            { CancelToken: axiosRequest }
          );
          if (!res.data) {
            dispatch({
              type: "flashMessage",
              value: {
                text: "Your session has expired. Please log in again.",
                alertType: "danger",
              },
            });
            dispatch({ type: "logout" });
          }
        })();
      } catch (error) {
        console.log(error);
      }
      return () => axiosRequest.cancel();
    }
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessage messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Routes>
              <Route
                exact
                path="/"
                element={state.loggedIn ? <Home /> : <HomeGuest />}
              />
              <Route
                path="/profile/:username/*"
                element={
                  <Protected isLoggedIn={state.loggedIn}>
                    <Profile />
                  </Protected>
                }
              />
              <Route
                path="/post/:id"
                element={
                  <Protected isLoggedIn={state.loggedIn}>
                    <ViewSinglePost />
                  </Protected>
                }
              />
              <Route
                path="/post/:id/edit"
                element={
                  <Protected isLoggedIn={state.loggedIn}>
                    <EditPost />
                  </Protected>
                }
              />
              <Route
                path="/create-post"
                element={
                  <Protected isLoggedIn={state.loggedIn}>
                    <CreatePost />
                  </Protected>
                }
              />
              <Route path="/about-us" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CSSTransition
            timeout={333}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(<Index />);

if (module.hot) module.hot.accept();
