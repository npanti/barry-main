window.$barry.changeCalcModeCenter = () => {
  if ("longest" === window.$barry.calculateMode) {
    window.$barry.calculateModeCenter = "longest";
  } else {
    window.$barry.calculateModeCenter = "center";
  }
};
