"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Image from 'next/image'

const NotConnected = () => {
  return (
    <>
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="70vh"
    >
        <Card variant="outlined" sx={{ minWidth: 275, p:4, textAlign:'center', alignItems:'center' }}>
          <CardContent>
          <img src="/img/logo.png" width="200"/>
          </CardContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
          <ConnectButton showBalance={false} />            
          </Box>
        </Card>
    </Box>
    </>
  );
};

export default NotConnected;
