// scripts/transform.js
const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");
const cbor = require("cbor");

const transform = (data) => {
  const newData = { ...data };
  if (newData?.validators?.length) {
    newData.validators = newData.validators.map(({ compiledCode, ...rest }) => {
      return {
        ...rest,
        compiledCode: Buffer.from(
          cbor.encode(Buffer.from(compiledCode, "hex"))
        ).toString("hex"),
      };
    });
  }

  return newData;
};

// Change this to the path to your JSON file
const files = glob.sync(path.resolve(__dirname, `./*.json`));
files.forEach((file) => {
  const jsonFilePath = path.resolve(__dirname, file);
  const jsonData = require(jsonFilePath);
  const transformedData = transform(jsonData);
  const filename = jsonFilePath.match(/\/([^/]+\.json)$/)?.[0]?.replace(".json", "");
  fs.outputFileSync(
    `./dist/contracts/${filename}-generated.json`,
    JSON.stringify(transformedData, null, 2)
  );
});
