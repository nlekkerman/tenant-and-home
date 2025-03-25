import React from "react";
import { AuthContext } from '@/context/AuthContext'; 
import PropertyListComponent from "@/components/home-components/PropertyListComponent";
const Home = () => {

  
  console.log(localStorage.getItem("access_token"))
  return (
    <div className="home-container">

    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-2">
    <div className="home-header ">
      <div className="header-content">
        <h3
         className="header-title">Dive in to The Roomie World</h3>
        <p className="header-subtitle">Find your ideal home !</p>
      </div>
    </div>

      {/* Include the PropertyManagement Component */}
      <PropertyListComponent />
    </div>
    </div>
  );
};

export default Home;
