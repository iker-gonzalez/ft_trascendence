import React from 'react';
import SignIn from './pages/Home';
import SetProfile from './pages/SetProfile';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import UserProfile from './pages/UserProfile';
import Game from './pages/Game';
import GameMatch from './components/GameMatch';
import GameIndex from './components/GameIndex';
import GameQueue from './components/GameQueue';
import LoadingPage from './pages/LoadingPage';
import Login from './components/Login';
import { UserDataProvider } from './context/UserDataContext';

function App() {
  return (
    <UserDataProvider>
      <Router>
        <div>
          <Navigation />
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/set-profile" element={<SetProfile />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/loading" element={<LoadingPage targetPath={''} />} />
            <Route path="game" element={<Game />}>
              <Route index element={<GameIndex />} />
              <Route path="queue" element={<GameQueue />} />
              <Route path="match" element={<GameMatch />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </UserDataProvider>
  );
}

export default App;
