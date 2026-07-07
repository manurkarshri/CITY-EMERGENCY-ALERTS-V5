console.log("Starting CITY EMERGENCY ALERTS V5 data pipeline...");

await import("./collect-news.js");
console.log("News collection complete.");

await import("./collect-official.js");
console.log("Official collection complete.");

await import("./collect-weather.js");
console.log("Weather collection complete.");

await import("./collect-river.js");
console.log("River status collection complete.");

await import("./collect-traffic.js");
console.log("Traffic status collection complete.");

await import("./incident-engine.js");
console.log("Incident engine complete.");

await import("./correlation-engine.js");
console.log("Correlation engine complete.");

await import("./cleanup-data.js");
console.log("Cleanup complete.");

await import("./build-status.js");
console.log("Status build complete.");

await import("./validate-data.js");
console.log("Validation complete.");

console.log("CITY EMERGENCY ALERTS V5 data pipeline finished successfully.");
