"use client";
import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";

import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";

import { contractAddress, contractAbi } from "@/constants";
import { publicClient } from "@/utils/client";

const OtherUser = () => {
  const { address } = useAccount();

  const [feedbacks, setFeedbacks] = useState([]);

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
          message: "Product has been registered",
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

  const getAllFeedback = async () => {
    try {
      const data = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getAllFeedback",
        account: address,
      });
      setFeedbacks(
        data.map((row, key) => ({
          id: Number(key),
          productId: Number(row.productId),
          compagnyId: Number(row.compagnyId),
          note: Number(row.note),
          comment: row.comment,
          likeCount: row.likeCount,
        }))
      );
      console.log(data);
    } catch (error) {
      handleOpenSnack({ stat: true, type: "error", message: error.message });
    }
  };

  const handleChange = (event) => {
    setProduct(event.target.value);
    console.log(event.target.value);
  };

  useEffect(() => {
    getAllFeedback();
  }, [feedbacks]);

  return (
    <Container maxWidth="sm">
      <div
        style={{
          padding: 10,
          marginTop: 20,
          backgroundColor: "#ECF0F1",
        }}
      >
        <b>USER : {address}</b>
      </div>
      <div
        style={{
          marginTop: 20,
          marginBottom: 20,
          paddingBottom: 5,
        }}
      >
        <Divider textAlign="left">All feedbacks</Divider>
        {feedbacks &&
          feedbacks.map(
            (row) =>
              row.productId != 0 &&
              row.allowed != false && (
                <Box sx={{ minWidth: 275, marginTop: 2 }}>
                  <Card variant="outlined">
                    <CardContent>
                      {/* <ChildComponent id={row.productId} /> */}
                      PRODUCT ID : {row.productId}
                      <br />
                      COMPAGNY ID : {row.compagnyId}
                      <Box
                        sx={{
                          "& > legend": { mt: 2 },
                        }}
                      >
                        <Typography component="legend">Rate</Typography>
                        <Rating value={row.note} readOnly/>
                      </Box>
                      <Box
                        sx={{
                          "& > legend": { mt: 2 },
                        }}
                      >
                        <Typography component="legend">User comment</Typography>
                        <div style={{fontSize:13}}>{row.comment}</div>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )
          )}
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
    </Container>
  );
};

export default OtherUser;
