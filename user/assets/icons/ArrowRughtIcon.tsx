import React from "react";
import { Svg, Path } from "react-native-svg";

interface ArrowRightIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const ArrowRightIcon: React.FC<ArrowRightIconProps> = ({
  width = 24,
  height = 24,
  color = "#000",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path d="M10 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export default ArrowRightIcon;
