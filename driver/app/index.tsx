import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function index() {
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const getData = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (accessToken) {
          setisLoggedIn(true);
        } else {
          setisLoggedIn(false);
        }
      } catch (error) {
        console.log(
          "Failed to retrieve access token from aysns storage",
          error
        );
      } finally {
        if (isMounted) {
          setisLoading(false);
        }
      }
    };
    getData();
    return () => {
      isMounted = false;
    };
  });

  if (isLoading) {
    return null;
  }
  return <Redirect href={!isLoggedIn ? "/(routes)/signup" : "/(tabs)/home"} />;
}
