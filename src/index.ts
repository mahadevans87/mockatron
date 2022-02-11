import { buildMock } from "./app";

let cliArguments = process.argv.slice(2);

if (cliArguments.length == 4) {
  let configFilePath: string | undefined;
  let outputFolder: string | undefined;

  if (cliArguments[0] === "--config") {
    configFilePath = cliArguments[1];
    if (cliArguments[2] === "--out") {
      outputFolder = cliArguments[3];
    } else {
      console.error(
        "mockatron needs valid arguments for input file and output folder"
      );
      process.exit(-1);
    }
  } else if (cliArguments[0] === "--out") {
    outputFolder = cliArguments[1];
    if (cliArguments[2] === "--config") {
      configFilePath = cliArguments[3];
    } else {
      console.error(
        "mockatron needs valid arguments for input file and output folder"
      );
      process.exit(-1);
    }
  }

  buildMock(configFilePath, outputFolder);
} else {
  console.error(
    "mockatron needs valid arguments for input file and output folder"
  );
  process.exit(-1);
}
