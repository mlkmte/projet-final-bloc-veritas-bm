"use client";
import React, { useState, useEffect } from "react";

import OwnerComponent from "@/components/Owner";
import UserComponent from "@/components/User";

import { contractAddress, contractAbi } from "@/constants";
import { useOwnerContext } from "@/context/owner";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";


export default function Home() {
  const { address, isConnected } = useAccount();
  const {
    owner,
    ownerLoading,
    refetchOwner,
    ownerPending,
    contractOwner,
    setOwner,
  } = useOwnerContext();

  const {
    data: isAcompagnyOwner,
    error: errorisAcompagnyOwner,
    isPending: isPendingIsAcompagnyOwner,
    refetch: refetchIsAcompagnyOwner,
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "isAcompagnyOwner",
    account: address,
  });

  const {
    data: isAcustomer,
    error: errorIsAcustomer,
    isPending: isPendingIsAcustomer,
    refetch: refetchIsAcustomer,
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "isAcustomer",
    account: address,
  });


  return (
    <>{address === contractOwner ? <OwnerComponent /> : <UserComponent isAcustomer={isAcustomer} isAcompagnyOwner={isAcompagnyOwner}/>}</>
  );
}
