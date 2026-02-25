/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "widget",
  name: "FlowActivityWidget",
  deploymentTarget: "16.2",
  frameworks: ["SwiftUI", "ActivityKit", "WidgetKit"],
  entitlements: {},
  colors: {
    WidgetBackground: { color: "#000000" },
    AccentColor: { color: "#FC4C02" },
  },
};
