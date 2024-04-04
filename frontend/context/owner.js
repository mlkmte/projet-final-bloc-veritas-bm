"use client";
import { createContext, useContext, useEffect, useState } from "react";

const OwnerContext = createContext({});
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";

import { contractAddress, contractAbi } from "@/constants";

export const OwnerContextProvider = ({ children }) => {
  const [owner, setOwner] = useState("");
  const { address } = useAccount();

  const {
    data: contractOwner,
    isLoading: ownerLoading,
    isPending: ownerPending,
    isFetching: ownerFetching,
    refetch: refetchOwner,
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "owner",
    account: address,
  });


  return (
    <OwnerContext.Provider value={{ contractOwner, owner, setOwner, refetchOwner, ownerLoading, ownerPending, ownerFetching }}>
      {children}
    </OwnerContext.Provider>
  );
};

export const useOwnerContext = () => useContext(OwnerContext);
