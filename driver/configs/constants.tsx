import { Driving, SmallCard, SmartCar, Wallet } from "@/utils/icons";
import Images from "../utils/images";
import color from "@/themes/app.colors";
import React from "react";

export const slides = [
  {
    id: 0,
    image: Images.destination,
    text: "Choose Your Destination",
    description: "First choose your destination where you want to go!",
  },
  {
    id: 1,
    image: Images.trip,
    text: "Wait for your driver",
    description: "Just wait for a while now until your driver is picking you!",
  },
  {
    id: 2,
    image: Images.bookRide,
    text: "Enjoy Your Trip",
    description:
      "Now enjoy your trip, pay your driver after reaching the destination!",
  },
];

export const rideData = [
  { id: "1", totalEarning: "NPR 1200", title: "Total Earning" },
  { id: "2", totalEarning: "12", title: "Complete Ride" },
  { id: "3", totalEarning: "1", title: "Pending Ride" },
  { id: "4", totalEarning: "04", title: "Cancel Ride" },
];

export const rideIcons = [
  <Wallet colors={color.primary} />,
  <SmartCar />,
  <SmallCard color={color.primary} />,
  <Driving color={color.primary} />,
];

export const recentRidesData: recentRidesTypes[] = [
  {
    id: "1",
    user: { name: "Sulav Gautam" }, // Changed `user` to an object
    rating: "5",
    earning: "142",
    pickup: "Pearl Academy, Ghorahi",
    dropoff: "Bharatpur Ground, Ghorahi",
    time: "31 Jan 01:34 pm",
    distance: "8km",
    charge: "142",
    createdAt: "2025-01-31T10:00:00Z", // Example ISO string
  },
];
