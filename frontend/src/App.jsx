import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./global.css";
import Header from "./pages/Header";
import GameTables from "./pages/GameTables";
import AddGame from "./pages/AddGame";
import UserStatus from "./pages/UserStatus";

const App = () => {
  return (
    <div className="app-container">
      <Header />
      <UserStatus />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tables" element={<GameTables />} />
          <Route path="/add-game" element={<AddGame />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
