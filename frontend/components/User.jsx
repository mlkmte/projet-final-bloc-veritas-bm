"use client";
import React, { useState, useEffect } from "react";

import CustomerComponent from "@/components/Customer";
import CompagnyComponent from "@/components/Compagny";
import OtherUserComponent from "@/components/OtherUser";

const User = ({ isAcustomer, isAcompagnyOwner }) => {
  return (
    <>
      {isAcustomer && <CustomerComponent isAcustomer={isAcustomer} />}
      {isAcompagnyOwner && (
        <CompagnyComponent isAcompagnyOwner={isAcompagnyOwner} />
      )}
      {!isAcompagnyOwner && !isAcustomer && <OtherUserComponent />}
    </>
  );
};

export default User;
