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
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";
import CardActions from "@mui/material/CardActions";

import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
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
        }))
      );
      // console.log(products);
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

  const handleSubmit = (productId) => {
    const rating = ratings[productId];
    const comment = comments[productId];
    // Here you can perform any action with the submitted rating and comment, like sending them to a server
    console.log(
      `Product ${productId}: Rating - ${rating}, Comment - ${comment}`
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
        {products &&
          products.map(
            (row) =>
              row.productId != 0 && (
                <Box sx={{ minWidth: 275, marginTop: 2 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <ChildComponent id={row.productId} />
                      ID : {row.productId}
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
                        onClick={() => handleSubmit(row.productId)}
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
