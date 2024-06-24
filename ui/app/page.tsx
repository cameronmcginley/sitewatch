"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import withAuth from "@/components/withAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL_ITEMS;

function Default() {
  return (
    <>
      <h1 className="text-2xl font-bold">My Homepage</h1>
      <p className="mt-4">Welcome to my homepage!</p>
    </>
  );
}

export default withAuth(Default);
