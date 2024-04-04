"use client";
import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";
import CardActions from "@mui/material/CardActions";

import {
  useAccount,
  useWriteContract,
} from "wagmi";

import { contractAddress, contractAbi } from "@/constants";
import { publicClient } from "@/utils/client";

const Customer = () => {
  const { address } = useAccount();

  const [value, setValue] = React.useState(0);
  const [products, setProducts] = useState([]);
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

  const getUserIdsProductsToRate = async () => {
    try {
      const data = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getUserIdsProductsToRate",
        account: address,
      });
      setProducts(
        data.map((row, key) => ({
          id: Number(key),
          productId: Number(row.productId),
          compagnyId: Number(row.compagnyId),
        }))
      );
    } catch (error) {
      handleOpenSnack({ stat: true, type: "error", message: error.message });
    }
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

  useEffect(() => {
    getUserIdsProductsToRate();
  }, []);

  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});

  const handleRatingChange = (productId, newValue) => {
    setRatings((prevState) => ({
      ...prevState,
      [productId]: newValue,
    }));
  };

  const handleCommentChange = (productId, event) => {
    setComments((prevState) => ({
      ...prevState,
      [productId]: event.target.value,
    }));
  };

  const {
    data: hash,
    isPending: isPending,
    writeContract: writeContract,
  } = useWriteContract({
    mutation: {
      onSuccess: () => {
        handleOpenSnack({
          stat: true,
          type: "success",
          message: "Review has been registered",
        });
        getUserIdsProductsToRate();
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

  const addFeedback = async (
    _compagnyId,
    _productId,
    _note,
    _comment,
    _purchaseDate,
    _likeCount
  ) => {
    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "addFeedback",
      args: [
        address,
        _compagnyId,
        _productId,
        _note,
        _comment,
        _purchaseDate,
        _likeCount,
      ],
      account: address,
    });
  };

  const handleSubmit = async (_productId, _compagnyId) => {
    const rating = ratings[_productId];
    const comment = comments[_productId];

    const compagnyId = _compagnyId;
    const date = 1711753200;
    const like = 0;
    await addFeedback(compagnyId, _productId, rating, comment, date, like);
    // console.log(
    //   `Commpagny : ${_compagnyId} - Product ${_productId}: Note - ${rating}, Comment - ${comment}, date achat - ${date}, like - ${like}`
    // );
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
        <b>CUSTOMERS</b>
        <br />
        CUSTOMER : {address}
      </div>

      <div
        style={{
          marginTop: 20,
          marginBottom: 20,
          paddingBottom: 5,
        }}
      >
        <Divider textAlign="left">Rate your products</Divider>
        {hash && (
          <Divider style={{ marginTop: 10 }}>
            <Chip label={hash} size="small" />
          </Divider>
        )}
        {products &&
          products.map(
            (row) =>
              row.productId != 0 &&
              row.allowed != false && (
                <Box sx={{ minWidth: 275, marginTop: 2 }}>
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
                        <Typography component="legend">Your rating</Typography>
                        <Rating
                          name={`rating-${row.productId}`}
                          value={ratings[row.productId] || 0}
                          onChange={(event, newValue) =>
                            handleRatingChange(row.productId, newValue)
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          "& > legend": { mt: 2 },
                        }}
                      >
                        <Typography component="legend">Your comment</Typography>
                        <TextField
                          label="How was your experience ?"
                          variant="outlined"
                          fullWidth
                          margin="normal"
                          value={comments[row.productId] || ""}
                          onChange={(event) =>
                            handleCommentChange(row.productId, event)
                          }
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() =>
                          handleSubmit(row.productId, row.compagnyId)
                        }
                      >
                        Rate
                      </Button>
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

export default Customer;
