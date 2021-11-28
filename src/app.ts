import SwaggerParser from "@apidevtools/swagger-parser";

const parseSwaggerFile = (file: string) => {
  try {
    const parser = new SwaggerParser();
    parser.validate(file);
    console.log("qweqwe");
  } catch (error) {
    console.log("Swagger parsing failed - " + error);
  }
};

parseSwaggerFile("res/petstore.yaml");
