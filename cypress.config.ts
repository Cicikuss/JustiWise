import { defineConfig } from "cypress";

export default defineConfig({
  projectId: '4q7ncb',

  reporter: 'mochawesome', // E2E dışında tanımlanmalı!
  reporterOptions: {
    reportDir: 'cypress/results',
    overwrite: false,
    html: true,
    json: true,
    timestamp: 'mm-dd-yyyy_HH-MM-ss',
    charts: true,
    reportPageTitle: 'Cypress Test Raporu - JustiWise',
    embeddedScreenshots: true,
    inlineAssets: true,
    autoOpen: false,
  },

  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // Sadece özel bir şey yapacaksan burası gerekir, gerek yoksa silinebilir.
      return config;
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
