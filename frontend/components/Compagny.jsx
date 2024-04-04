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

import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";

import { contractAddress, contractAbi } from "@/constants";
import { publicClient } from "@/utils/client";

const Compagny = ({ isAcompagnyOwner }) => {
  const { address } = useAccount();

  const [compagnyId, setCompagnyId] = useState("");
  const [productRef, setProductRef] = useState("");
  const [url, setUrl] = useState("base_url");

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState("");
  const [userAddress, setUserAddress] = useState("");

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
        fetchProducts();
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

  const {
    data: hash2,
    isPending: isPending2,
    writeContract: writeContract2,
  } = useWriteContract({
    mutation: {
      onSuccess: () => {
        handleOpenSnack({
          stat: true,
          type: "success",
          message: "Customer has been registered",
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

  const addProduct = async () => {
    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "addProduct",
      args: [compagnyId, productRef, url],
      account: address,
    });
  };

  const addUserProduct = async () => {
    writeContract2({
      address: contractAddress,
      abi: contractAbi,
      functionName: "addUserProduct",
      args: [userAddress, compagnyId, product],
      account: address,
    });
  };

  const fetchProducts = async () => {
    try {
      const data = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getAllCompagnyProducts",
        args: [compagnyId],
        account: address,
      });
      setProducts(
        data.map((row, key) => ({
          id: Number(key),
          productRef: row.productRef,
          productId: row.productId,
        }))
      );
      console.log(products);
    } catch (error) {
      handleOpenSnack({ stat: true, type: "error", message: error.message });
    }
  };

  const handleChange = (event) => {
    setProduct(event.target.value);
    console.log(event.target.value);
  };

  useEffect(() => {
    setCompagnyId(isAcompagnyOwner.toString());
    fetchProducts();
  }, [isAcompagnyOwner, compagnyId]);

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Container maxWidth="sm">
      <div
        style={{
          padding: 10,
          marginTop: 20,
          backgroundColor: "#ECF0F1",
        }}
      >
        <b>CUSTOMERS AND PRODUCTS REGISTRATION</b>
        <br />
        COMPAGNY ID : {compagnyId}
      </div>
      <div
        style={{
          marginTop: 20,
          marginBottom: 20,
          paddingBottom: 5,
        }}
      >
        <Divider textAlign="left">Products registration</Divider>
        <div>
          <TextField
            label="Product reference"
            variant="outlined"
            fullWidth
            margin="normal"
            value={productRef}
            onChange={(event) => {
              setProductRef(event.target.value);
            }}
          />

          {hash && (
            <Divider style={{ marginTop: 10 }}>
              <Chip label={hash} size="small" />
            </Divider>
          )}

          <LoadingButton
            onClick={addProduct}
            loading={isPending}
            style={{ marginTop: 10 }}
            fullWidth
            size="large"
            variant="contained"
            color="primary"
          >
            <span>Submit</span>
          </LoadingButton>
        </div>
      </div>
      <div
        style={{
          marginTop: 20,
          marginBottom: 20,
          paddingBottom: 5,
        }}
      >
        <Divider textAlign="left">Customers registration</Divider>
        <TextField
          label="Customer address"
          variant="outlined"
          fullWidth
          margin="normal"
          value={userAddress}
          onChange={(event) => {
            setUserAddress(event.target.value);
          }}
        />
        <FormControl sx={{ width: "100%" }}>
          <InputLabel id="demo-simple-select-helper-label">Product</InputLabel>
          <Select
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            fullWidth
            value={product}
            label="Product"
            onChange={handleChange}
          >
            {products &&
              products.map((row) => (
                <MenuItem value={row.productId} key={crypto.randomUUID()}>
                  Product reference : {row.productRef}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        {hash2 && (
          <Divider style={{ marginTop: 20 }}>
            <Chip label={hash2} size="small" />
          </Divider>
        )}
        <LoadingButton
          onClick={addUserProduct}
          loading={isPending2}
          style={{ marginTop: 10 }}
          fullWidth
          size="large"
          variant="contained"
          color="primary"
        >
          <span>Submit</span>
        </LoadingButton>
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

export default Compagny;
