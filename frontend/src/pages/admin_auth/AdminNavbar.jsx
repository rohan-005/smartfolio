/* eslint-disable */
import React from "react";
import { removeAdminToken } from "../../utils/adminAuth";

const AdminNavbar = () => {
  const logout = () => {
    removeAdminToken();
    window.location.href = "/admin";
  };

  return (
    <nav className="w-full bg-black text-white p-4 flex justify-between items-center shadow-lg">
      <h2 className="text-xl font-bold">SmartFolio Admin</h2>
      <button onClick={logout} className="bg-[#beb88d] px-4 py-2 rounded-xl text-black font-semibold">
        Logout
      </button>
    </nav>
  );
};

export default AdminNavbar;
