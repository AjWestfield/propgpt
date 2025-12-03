import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

interface NCAABasketballLogoProps {
  width?: number;
  height?: number;
}

export const NCAABasketballLogo: React.FC<NCAABasketballLogoProps> = ({
  width = 32,
  height = 32
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 192.756 192.756">
      <G fillRule="evenodd" clipRule="evenodd">
        {/* Transparent background */}
        <Path fill="#fff" fillOpacity="0" d="M0 0h192.756v192.756H0V0z" />

        {/* Main blue parallelogram */}
        <Path
          fill="#1879bf"
          d="M170.201 46.431l-36.89 136.888H13.594L50.486 46.431h119.715z"
        />

        {/* White basketball swoosh effect - top layer */}
        <Path
          d="M149.607 124.902c20.877-7.876 32.764-18.333 34.043-29.438 2.43-21.1-30.941-39.153-74.529-40.326C65.9 53.975 28.862 69.849 25.875 90.686c6.289-17.642 38.464-30.598 75.577-29.6 40.012 1.078 70.609 17.966 68.336 37.722-.834 7.254-9.941 16.829-19.236 21.134l-.945 4.96z"
          fill="#fff"
        />

        {/* Pink/red swoosh - middle layer */}
        <Path
          d="M101.926 57.312c40.014 1.078 70.611 17.967 68.338 37.723-1.748 15.178-22.385 27.632-50.002 32.099 34.729-3.249 61.811-17.571 63.867-35.442 2.424-21.099-30.939-39.153-74.531-40.327-43.223-1.162-81.831 15.89-84.816 36.727 6.289-17.647 40.034-31.779 77.144-30.78z"
          fill="#cc1e4c"
        />
      </G>
    </Svg>
  );
};
