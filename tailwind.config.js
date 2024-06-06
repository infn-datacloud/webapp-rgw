/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      primary: {
        DEFAULT: "#002a48",
        50: "#002a4880",
        hover: "#20385a",
        light: "#4196b4",
        hover: "#347890",
      },
      secondary: {
        DEFAULT: "#fefefe",
        50: "#fefefe80",
        hover: "#fefefedd",
      },
      success: {
        DEFAULT: "#3da657",
        50: "#35de2380",
        hover: "#3da657",
      },
      warning: {
        DEFAULT: "#ffc107",
        50: "#ffc10780",
        hover: "#ffc822",
      },
      danger: {
        DEFAULT: "#de2335",
        50: "#de233580",
        hover: "#ed2639",
      },
    },
    extend: {
      container: {
        center: true,
      },
      borderRadius: {
        DEFAULT: "10px",
        half: "5px",
      },
      textColor: {
        DEFAULT: "#dc2626",
      },
    },
    plugins: [],
  },
};
