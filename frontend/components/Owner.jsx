"use client";
import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import LoggerComponent from "@/components/Logger";

import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";

import { contractAddress, contractAbi } from "@/constants";

const Owner = () => {
  const { address } = useAccount();

  const [compagnyName, setCompagnyName] = useState("");
  const [city, setCity] = useState("");
  const [siret, setSiret] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("");
  const [compagnyOwnerAddress, setCompagnyOwnerAddress] = useState("");

  const [stateSnack, setStateSnack] = useState({
    stat: false,
    type: "error",
    message: "Error occurred while processing your request",
  });
  const handleOpenSnack = (input) =>
    setStateSnack({
      stat: input.stat,
      type: input.type,
      message: input.message,
    });
  const handleCloseSnack = () =>
    setStateSnack({
      stat: false,
      type: stateSnack.type,
      message: stateSnack.message,
    });

  const {
    data: hash,
    isPending,
    writeContract,
  } = useWriteContract({
    mutation: {
      onSuccess: () => {
        handleOpenSnack({
          stat: true,
          type: "success",
          message: "Transaction add compagny in progress",
        });
      },
      onError: (error) => {
        handleOpenSnack({
          stat: true,
          type: "error",
          message: error.shortMessage,
        });
        console.log(error);
      },
    },
  });

  const addCompagny = async () => {
    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "addCompagny",
      args: [compagnyName, city, siret, subscriptionType, compagnyOwnerAddress],
      account: address,
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: errorConfirmation,
  } = useWaitForTransactionReceipt({
    hash,
  });
  useEffect(() => {
    if (isConfirmed) {
      handleOpenSnack({
        stat: true,
        type: "success",
        message: "Transaction has been registered",
      });
    }
    if (errorConfirmation) {
      handleOpenSnack({
        stat: true,
        type: "error",
        message: errorConfirmation.message,
      });
    }
  }, [isConfirmed, errorConfirmation]);

  return (
    <Container maxWidth="sm">
      <div
        style={{
          padding: 10,
          marginTop: 20,
          backgroundColor: "#ECF0F1",
        }}
      >
        <b>COMPAGNY REGISTRATION</b>
        <br />
        OWNER : {address}
      </div>
      <div
        style={{
          marginTop: 20,
          marginBottom: 20,
          paddingBottom: 5,
        }}
      >
        <div>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={compagnyName}
            onChange={(event) => {
              setCompagnyName(event.target.value);
            }}
          />
          <TextField
            label="City"
            variant="outlined"
            fullWidth
            margin="normal"
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
            }}
          />
          <TextField
            label="Siret number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={siret}
            onChange={(event) => {
              setSiret(event.target.value);
            }}
          />
          <TextField
            label="Subscription type"
            variant="outlined"
            fullWidth
            margin="normal"
            value={subscriptionType}
            onChange={(event) => {
              setSubscriptionType(event.target.value);
            }}
          />
          <TextField
            label="Compagny owner address"
            variant="outlined"
            fullWidth
            margin="normal"
            value={compagnyOwnerAddress}
            onChange={(event) => {
              setCompagnyOwnerAddress(event.target.value);
            }}
          />
          <LoadingButton
            onClick={addCompagny}
            loading={isPending}
            style={{ marginTop: 20 }}
            fullWidth
            size="large"
            variant="contained"
            color="primary"
          >
            <span>Submit</span>
          </LoadingButton>
          {hash && (
            <Divider style={{ marginTop: 20 }}>
              <Chip label={hash} size="small" />
            </Divider>
          )}
        </div>
      </div>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={stateSnack.stat}
        onClose={handleCloseSnack}
      >
        <Alert
          onClose={handleCloseSnack}
          severity={stateSnack.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {stateSnack.message
            ? stateSnack.message
            : "Error occurred while processing your request"}
        </Alert>
      </Snackbar>

      <LoggerComponent />
    </Container>
  );
};

export default Owner;
