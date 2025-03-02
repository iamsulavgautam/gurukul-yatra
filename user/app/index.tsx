import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React from "react";
import { useEffect, useState } from "react";
import "react-native-get-random-values";
import 'react-native-url-polyfill/auto';

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

  return (
    <Redirect href={!isLoggedIn ? "/(routes)/onboarding" : "/(tabs)/home"} />
  );
}
