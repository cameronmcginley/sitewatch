import React from "react";
import { MutatingDots } from "react-loader-spinner";

const DeleteOverlay = () => {
  // Define the gradient background directly in CSS
  const gradientBackground = `radial-gradient(circle, 
    rgba(0,0,0,1) 0%, 
    rgba(0,0,0,1) 50%, 
    rgba(0,0,0,0) 100%
    )`;

  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50">
      <div className="flex flex-col justify-center items-center">
        <div
          className="absolute w-64 h-64 rounded-full"
          style={{
            background: gradientBackground,
          }}
        ></div>
        <p className="text-2xl font-semibold text-white z-10">Deleting...</p>
        <MutatingDots
          height="100"
          width="100"
          color="#000"
          secondaryColor="#000"
          radius="12.5"
          ariaLabel="mutating-dots-loading"
          wrapperStyle={{ zIndex: "10" }}
          wrapperClass=""
        />
      </div>
    </div>
  );
};

export default DeleteOverlay;
