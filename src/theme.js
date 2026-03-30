import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  fonts: {
    heading: "'Bricolage Grotesque', sans-serif",
    body: "'Bricolage Grotesque', sans-serif",
  },
  colors: {
    brand: {
      50: "#f7f2e7",
      100: "#ead8a7",
      200: "#ddc37a",
      300: "#d1af52",
      400: "#c79d35",
      500: "#af8423",
      600: "#8a6619",
      700: "#654813",
      800: "#412c0b",
      900: "#201503",
    },
    midnight: {
      50: "#eef1f7",
      100: "#cfd8ea",
      200: "#aebfda",
      300: "#8ca5cb",
      400: "#6f8ec0",
      500: "#5877a7",
      600: "#445d83",
      700: "#30415e",
      800: "#1b2539",
      900: "#09111f",
    },
  },
  styles: {
    global: (props) => ({
      "html, body, #root": {
        minHeight: "100%",
        background: mode(
          "radial-gradient(circle at top, rgba(201, 162, 39, 0.10), transparent 30%), linear-gradient(135deg, #faf7f0 0%, #f4efe4 45%, #ebe3d2 100%)",
          "radial-gradient(circle at top, rgba(201, 162, 39, 0.18), transparent 30%), linear-gradient(135deg, #09111f 0%, #101a2f 45%, #15213b 100%)"
        )(props),
        color: mode("midnight.900", "white")(props),
      },
      body: {
        overflowX: "hidden",
        overflowY: "auto",
      },
      "*::placeholder": {
        color: mode("rgba(9, 17, 31, 0.48)", "rgba(255,255,255,0.45)")(props),
      },
      "*::-webkit-scrollbar": {
        width: "8px",
        height: "8px",
      },
      "*::-webkit-scrollbar-thumb": {
        background: mode("rgba(175, 132, 35, 0.35)", "rgba(201, 162, 39, 0.35)")(props),
        borderRadius: "999px",
      },
      "*::-webkit-scrollbar-track": {
        background: mode("rgba(9, 17, 31, 0.06)", "rgba(255, 255, 255, 0.06)")(props),
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "full",
        fontWeight: "600",
      },
    },
    Input: {
      variants: {
        filled: (props) => ({
          field: {
            bg: mode("rgba(9,17,31,0.05)", "whiteAlpha.120")(props),
            border: "1px solid",
            borderColor: mode("rgba(9,17,31,0.10)", "whiteAlpha.200")(props),
            color: mode("midnight.900", "white")(props),
            _hover: {
              bg: mode("rgba(9,17,31,0.08)", "whiteAlpha.180")(props),
            },
            _focusVisible: {
              borderColor: "brand.300",
              boxShadow: "0 0 0 1px rgba(221, 195, 122, 0.8)",
            },
          },
        }),
      },
      defaultProps: {
        variant: "filled",
      },
    },
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: mode("rgba(255, 251, 245, 0.96)", "rgba(11, 18, 32, 0.96)")(props),
          color: mode("midnight.900", "white")(props),
          border: `1px solid ${mode("rgba(9,17,31,0.08)", "rgba(255,255,255,0.08)")(props)}`,
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.20)",
          backdropFilter: "blur(18px)",
        },
      }),
    },
  },
});

export default theme;
