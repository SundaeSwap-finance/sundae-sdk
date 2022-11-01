const isYarn = process.env.npm_execpath?.includes("yarn");

if (!isYarn) {
  console.log("=========================================");
  console.log("Please install / add dependencies via yarn");
  console.log("Other managers are not allowed");
  console.log("=========================================");
  process.exit(1);
}
