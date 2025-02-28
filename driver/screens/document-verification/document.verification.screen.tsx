import { View, Text, ScrollView, TextInput } from "react-native";
import React, { useState } from "react";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import ProgressBar from "@/components/common/progress.bar";
import styles from "../signup/styles";
import { Colors } from "react-native/Libraries/NewAppScreen";
import TitleView from "@/components/signup/title.view";
import Input from "@/components/common/input";
import { useTheme } from "@react-navigation/native";
import SelectInput from "@/components/common/select-input";
import { countryNameItems } from "@/configs/country-name-list";
import Button from "@/components/common/button";
import color from "@/themes/app.colors";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { Toast } from "react-native-toast-notifications";
import Constants from 'expo-constants';


export default function DocumentVerificationScreen() {
  const driverData = useLocalSearchParams();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: "RICKSHAW",
    registrationNumber: "",
    registrationDate: "",
    drivingLicenseNumber: "",
    color: "",
    rate: "",
  });
  const handleChange = (key: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };
  const handleSubmit = async () => {
    setLoading(true);

    const driver = {
      ...driverData,
      vehicle_type: formData.vehicleType,
      registration_number: formData.registrationNumber,
      registration_date: formData.registrationDate,
      driving_license: formData.drivingLicenseNumber,
      vehicle_color: formData.color,
      rate: formData.rate,
    };

    await axios
      .post(`${Constants.expoConfig?.extra?.EXPO_PUBLIC_SERVER_URI}/driver/send-otp`, {
        phone_number: `+${driverData.phone_number}`,
      })
      .then((res) => {
        router.push({
          pathname: "/(routes)/verification-phone-number",
          params: driver,
        });
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        Toast.show(error.message, {
          placement: "bottom",
          type: "danger",
        });
      });
  };
  return (
    <ScrollView>
      <View>
        <Text
          style={{
            fontFamily: "TT-Octosquares-Medium",
            fontSize: windowHeight(22),
            paddingTop: windowHeight(50),
            textAlign: "center",
          }}
        >
          Gurukul Yatra
        </Text>
        <View style={{ padding: windowWidth(20) }}>
          <ProgressBar fill={1} />
          <View
            style={[styles.subView, { backgroundColor: Colors.background }]}
          >
            <View style={styles.space}>
              <TitleView
                title={"Vehicle Registration"}
                subTitle={"Explore your life by joining Gurukul Yatra"}
              />
              <SelectInput
                title="Vehicle Type"
                placeholder="Choose your vehicle type"
                value={formData.vehicleType}
                onValueChange={(text) => handleChange("vehicleType", text)}
                showWarning={showWarning && formData.vehicleType === ""}
                warning={"Please choose your vehicle type!"}
                items={[{ label: "RICKSHAW", value: "RICKSHAW" }]}
              />

              <Input
                title="Registration Number"
                placeholder="Enter your vehicle registration number"
                keyboardType="number-pad"
                value={formData.registrationNumber}
                onChangeText={(text) =>
                  handleChange("registrationNumber", text)
                }
                showWarning={showWarning && formData.registrationNumber === ""}
                warning={"Please enter your vehicle registration number!"}
              />
              <Input
                title="Vehicle Registration Date"
                placeholder="Enter your vehicle registration date"
                value={formData.registrationDate}
                onChangeText={(text) => handleChange("registrationDate", text)}
                showWarning={showWarning && formData.registrationDate === ""}
                warning={"Please enter your vehicle Registration Date number!"}
              />
              <Input
                title={"Driving License Number"}
                placeholder={"Enter your driving license number"}
                keyboardType="number-pad"
                value={formData.drivingLicenseNumber}
                onChangeText={(text) =>
                  handleChange("drivingLicenseNumber", text)
                }
                showWarning={
                  showWarning && formData.drivingLicenseNumber === ""
                }
                warning={"Please enter your driving license number!"}
              />
              <Input
                title={"Vehicle Color"}
                placeholder={"Enter your vehicle color"}
                value={formData.color}
                onChangeText={(text) => handleChange("color", text)}
                showWarning={showWarning && formData.color === ""}
                warning={"Please enter your vehicle color!"}
              />
              <Input
                title={"Rate per km"}
                placeholder={"1km ko kati paisa line?"}
                keyboardType="number-pad"
                value={formData.rate}
                onChangeText={(text) => handleChange("rate", text)}
                showWarning={showWarning && formData.rate === ""}
                warning={
                  "Please enter how much you want to charge from your customer per km."
                }
              />
            </View>
            <View style={styles.margin}>
              <Button
                onPress={() => handleSubmit()}
                title={"Submit"}
                height={windowHeight(30)}
                backgroundColor={color.buttonBg}
                textColor={color.whiteColor}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
