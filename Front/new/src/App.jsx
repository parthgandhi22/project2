import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login"
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home"

const App = () => {
  return (
      <div>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
  );
};

export default App;
