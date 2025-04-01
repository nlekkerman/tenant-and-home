import React from "react";
import { AuthContext } from '@/context/AuthContext'; 
import PropertyListComponent from "@/components/home-components/PropertyListComponent";
/**
 * Home Component for the Main Landing Page
 *
 * This component serves as the landing page of the application. It presents a welcoming message to users 
 * and includes a `PropertyListComponent` that displays a list of properties available for users to explore. 
 * The main goal of this page is to provide a smooth entry point into the app's core functionality: 
 * searching for and browsing properties.
 *
 * Features:
 * - Displays a header with a welcoming message and subtitle.
 * - Includes the `PropertyListComponent` that handles displaying a list of properties.
 * - Logs the access token from local storage for debugging purposes.
 * 
 * Key Functions:
 * - No specific functions are used within this component, aside from the rendering of static content 
 *   and the inclusion of the `PropertyListComponent`.
 *
 * Dependencies:
 * - React (`useState`, `useEffect`) for the basic component structure and state management.
 * - `AuthContext`: The authentication context, though not actively used here, provides context 
 *   for managing authentication (likely intended for future use or for debugging).
 * - `PropertyListComponent`: A component that manages the rendering of the list of properties.
 *
 * Usage:
 * ```jsx
 * <Home />
 * ```
 *
 * Notes:
 * - The page layout consists of a flex container with centered content, making the landing page 
 *   visually appealing and responsive.
 * - The `console.log(localStorage.getItem("access_token"))` is used for debugging purposes, 
 *   allowing developers to check the value of the access token in local storage.
 * - The content of the page is contained within a "home-container" div with additional styling applied 
 *   for a pleasant user experience.
 */

const Home = () => {
  
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
