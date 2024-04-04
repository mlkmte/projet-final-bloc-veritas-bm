"use client";
import React, { useState, useEffect } from "react";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Fingerprint from "@mui/icons-material/Fingerprint";
import CardActions from "@mui/material/CardActions";

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
          message: "Your like has been registered",
        });
        getAllFeedback();
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

  const like = async (_feedbackId) => {
    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "likeFeedback",
      args: [_feedbackId],
      account: address,
    });
  };

  const getProductDetailsById = async (idProduct) => {
    try {
      const data = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getProductDetailsById",
        account: address,
        args: [idProduct],
      });
      return data;
    } catch (error) {
      handleOpenSnack({ stat: true, type: "error", message: error.message });
    }
  };

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


  useEffect(() => {
    getAllFeedback();
  }, []);

  const handleSubmit = async (_feedbackId) => {
    await like(_feedbackId);
    console.log(`Feedback : ${_feedbackId}`);
  };

  const ChildComponent = ({ id }) => {
    const [productDetails, setProductDetails] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const data = await getProductDetailsById(id);
          setProductDetails(data);
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      };
      fetchData();
    }, [id]);

    return (
      <div>
        {productDetails && (
          <Typography variant="h5" component="div">
            Product reference : {productDetails.productRef}
          </Typography>
        )}
      </div>
    );
  };

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
        {hash && (
          <Divider style={{ marginTop: 10 }}>
            <Chip label={hash} size="small" />
          </Divider>
        )}
        {feedbacks &&
          feedbacks.map(
            (row, i) =>
              row.productId != 0 &&
              row.allowed != false && (
                <Box
                  key={crypto.randomUUID()}
                  sx={{ minWidth: 275, marginTop: 2 }}
                >
                  <Card variant="outlined">
                    <CardContent>
                      <ChildComponent id={row.productId} />
                      PRODUCT ID : {row.productId}
                      <br />
                      COMPAGNY ID : {row.compagnyId}
                      <Box
                        sx={{
                          "& > legend": { mt: 2 },
                        }}
                      >
                        <Typography component="legend">Rate</Typography>
                        <Rating value={row.note} readOnly />
                      </Box>
                      <Box
                        sx={{
                          "& > legend": { mt: 2 },
                        }}
                      >
                        <Typography component="legend">User comment</Typography>
                        <div style={{ fontSize: 13 }}>{row.comment}</div>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          aria-label="fingerprint"
                          color="secondary"
                          onClick={() => handleSubmit(i)}
                        >
                          <Fingerprint />
                        </IconButton>
                      </Stack>
                      <div>{Number(row.likeCount)}</div>
                    </CardActions>
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
