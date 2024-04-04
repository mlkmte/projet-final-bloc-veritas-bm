"use client";
import React, { useState, useEffect } from "react";
import Container from '@mui/material/Container';

import Header from "./Header";
import Footer from "./Footer";

import { useOwnerContext } from "@/context/owner";
import { useAccount } from "wagmi";

//Importation des composants
import NotConnected from "@/components/NotConnected";

const Layout = ({ children }) => {
  
  const { isConnected } = useAccount();

  return (
    <Container maxWidth="lg">
        {isConnected ? (
          <><Header />{children}</>
        ) : (
          <>
            <NotConnected />
          </>
        )}
    </Container>
  );
};

export default Layout;
