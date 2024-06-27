"use client";

import React from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL_ITEMS;

function Root() {
  return (
    <>
      <h1 className="text-2xl font-bold">My Homepage</h1>
      <p className="mt-4">Welcome to my homepage!</p>
    </>
  );
}

export default Root;
