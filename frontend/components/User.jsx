"use client";
import React, { useState, useEffect } from "react";

import CustomerComponent from "@/components/Customer";
import CompagnyComponent from "@/components/Compagny";

const User = ({ isAcustomer, isAcompagnyOwner }) => {

  return (
    <>
      {isAcustomer && <CustomerComponent isAcustomer={isAcustomer} />}
      {isAcompagnyOwner && <CompagnyComponent isAcompagnyOwner={isAcompagnyOwner} />}
    </>
  );
};

export default User;
