import path from "path";
import glob from "glob";
import {
  Extractor,
  ExtractorConfig,
  ExtractorResult,
} from "@microsoft/api-extractor";

function generateDocs() {
  const apis = glob.sync("./packages/**/api-extractor.json");
  if (!apis) {
    console.info("No APIs were found to generate!");
    return;
  }

  apis.forEach((api) => {
    // Load and parse the api-extractor.json file
    const extractorConfig: ExtractorConfig =
      ExtractorConfig.loadFileAndPrepare(api);

    // Invoke API Extractor
    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
      // Equivalent to the "--local" command-line parameter
      localBuild: true,

      // Equivalent to the "--verbose" command-line parameter
      showVerboseMessages: true,
    });

    if (extractorResult.succeeded) {
      console.log(`API Extractor completed successfully`);
    } else {
      console.error(
        `API Extractor completed with ${extractorResult.errorCount} errors` +
          ` and ${extractorResult.warningCount} warnings`
      );
      process.exitCode = 1;
    }
  });
}

generateDocs();
