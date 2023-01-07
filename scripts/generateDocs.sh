ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(basename "${CODEBUILD_SRC_DIR:=${ROOT}}")"
TARGET="${ROOT}/src/**/*.ts"
TGZ="${TARGET}/${REPO}-${VERSION}.tar.gz"
FUNCTIONS="${TARGET}/functions"

for dir in "${ROOT}"/packages/*; do
  API=$(basename "$dir")
  if [ "$API" = "demo" ]; then
    continue
  fi

  OUTPUT="$ROOT"/packages/"$API"/openapi
  SOURCE="$ROOT"/packages/"$API""/src/**/*.ts"
  
  # Build OpenAPI
  yarn typeconv -f ts -t oapi -o "$OUTPUT" "$SOURCE"
  # yarn redocly bundle "$OUTPUT"
done
# import fs from "fs";
# import path from "path";
# import glob from "glob";
# import { getTypeScriptReader, getOpenApiWriter, makeConverter } from "typeconv";



# function generateDocs() {
#   const apis = glob.sync("./packages/**/api-extractor.json");
#   if (!apis) {
#     console.info("No APIs were found to generate!");
#     return;
#   }

#   apis.forEach(async (api) => {
#     const packageJson = await import(
#       path.resolve(api.replace("api-extractor.json", "package.json")),
#       // @ts-ignore
#       {
#         assert: { type: "json" },
#       }
#     ).then(({ default: data }) => data);
#     const name = packageJson.name.replace("@sundae/", "");
#     const reader = getTypeScriptReader({});
#     const writer = getOpenApiWriter({
#       format: "yaml",
#       title: name,
#       version: packageJson.version,
#     });
#     const { convert } = makeConverter(reader, writer);
#     const { data } = await convert({
#       data: path.resolve(api.replace("api-extractor.json", "src/**/*.ts")),
#     });
#     fs.mkdirSync(path.resolve("./docs/config/openapi/" + name), {
#       recursive: true,
#     });
#     fs.writeFileSync("./docs/config/openapi/" + name + "/openapi.yaml", data, {
#       encoding: "utf-8",
#     });
#   });
# }

# generateDocs();
