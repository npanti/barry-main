// Define a global object on the window called $barry to store all app-wide settings and references
window.$barry = {
  // Calculation methods with their labels and colors
  methods: {
    longMiddle: {
      label: "Centre géométrique des points à mi-parcours en temps de tous les trajets entre villes",
      color: "#10b981",
    },
    average: {
      label: "La moyenne des coordonnées des villes",
      color: "#3b82f6",
    },
    center: {
      label: "Le centre du cadre dans lequel toutes les villes sont présentes",
      color: "#f59e0b",
    },
  },

  // General color settings
  addressColor: "#111827",
  resultColor: "#EF4444",
  roadColor: "#47695B",

  // Calculation settings
  calculateMode: "time",           // Calculation mode (e.g., by time)
  calculateTransport: "Voiture",   // Transport type (e.g., car)
  calculateToll: true,             // Whether to include tolls

  // Data containers
  addressesCount: 0,               // Number of addresses
  places: {},                      // Place data
  layers: {},                      // Map layers
  addressToCalc: {},               // Addresses to calculate

  // API settings
  urlTourismAPI: "https://titi.gougouzian.fr", // Tourism API endpoint
  tourismCategory: [                          // Categories for tourism POIs
    "Sports",
    "Cultural",
    "Hotel",
    "Food",
    "Camping",
    "Event",
    "Tour",
  ],
  pois: {},                                   // Points of interest

  // Cached DOM elements for UI manipulation
  $addressesWrapper: document.getElementById("addresses-wrapper"),
  $augmentConfiguration: document.getElementById("augmentConfiguration"),
  $augmentWelcome: document.getElementById("augmentWelcome"),
  $calculate: document.getElementById("calculate"),
  $configuration: document.getElementById("configuration"),
  $log: document.getElementById("log"),
  $logContent: document.getElementById("log-content"),
  $newsearch: document.getElementById("newsearch"),
  $reduceConfiguration: document.getElementById("reduceConfiguration"),
  $reduceWelcome: document.getElementById("reduceWelcome"),
  $pois: document.getElementById("pois"),
  $rappel: document.getElementById("rappel"),
  $spinner: document.getElementById("spinner"),
  $toggleCalcMode: document.getElementById("toggleCalcMode"),
  $toggleLogMode: document.getElementById("toggleLogMode"),
  $welcome: document.getElementById("welcome"),
  $popin: document.getElementById("popin"),
};
