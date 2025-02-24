import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import AuthContainer from "@/utils/container/auth-container";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import styles from "./styles";
import Images from "@/utils/images";
import SignInText from "@/components/login/signin.text";
import PhoneNumberInput from "@/components/login/phone-number.input";
import { external } from "@/styles/external.style";
import Button from "@/components/common/button";
import { router } from "expo-router";

export default function LoginScreen() {
  const [phone_number, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+977");

  return (
    <AuthContainer
      topSpace={windowHeight(150)}
      imageShow={true}
      container={
        <View>
          <View>
            <Image style={styles.transformLine} source={Images.line} />
            <SignInText />
            <View style={[external.mt_25, external.Pb_10]}>
              <PhoneNumberInput
                phone_number={phone_number}
                setphone_number={setPhoneNumber}
                countryCode={countryCode}
                setCountryCode={setCountryCode}
              />
              <View style={[external.mt_25, external.Pb_15]}>
                <Button
                  title="Get Otp"
                  height={windowHeight(35)}
                  onPress={() => router.push("/(routes)/verification-phone-number")}                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: windowWidth(8),
                  paddingBottom: windowHeight(15),
                }}
              >
                <Text style={{ fontSize: windowHeight(12) }}>
                  Don't have any rider account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/(routes)/signup")}>
                  <Text style={{ fontSize: windowHeight(12), color: "blue" }}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      }
    />
  );
}
