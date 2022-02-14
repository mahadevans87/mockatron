import { copyDir } from './utils/functions';
import * as fs from 'fs';
import path from 'path';

import { IResponse, IRoute } from './models/IRoute';
import { TemplateParser } from './parsers/templateParser';

const parseRouteResponse = (response: IResponse, definitions: any): string => {
  let routeResponse = '';

  if (response.constraint) {
    routeResponse = `if (${response.constraint}) {\n`;
  }

  // body can be in def(body) or file(body) -> this one is for the future if the JSON grows bigger
  let responseBody = response.body;
  if (response.body.startsWith('def(')) {
    responseBody = definitions[response.body.slice(4, -1)];
  }

  routeResponse = `${routeResponse} return res.status(${response.statusCode}).json(${responseBody}) \n`;
  if (response.constraint) {
    routeResponse = `${routeResponse}}\n`;
  }

  return routeResponse;
};

const parseRouteResponses = (responses: IResponse[], definitions: any) =>
  responses.map((response) => parseRouteResponse(response, definitions));

const parseRoute = (route: IRoute, definitions: any) => {
  const routeContents = parseRouteResponses(route.responses, definitions).join(
    '\n\n'
  );
  return `router.${route.method.toLowerCase()}('${
    route.path
  }', (req, res) => {${routeContents}});`;
};

const parseRoutes = (routes: any, definitions: any) =>
  routes.map((route) => parseRoute(route, definitions));

const buildPackage = (
  requests: any,
  configFolder: string,
  outputFolder: string
) => {
  const contextPath = requests.contextPath;
  const routesString = parseRoutes(requests.routes, requests.definitions).join(
    '\n\n'
  );

  // Create a new directory and copy template files
  fs.existsSync(outputFolder)
    ? fs.rmSync(outputFolder, { recursive: true })
    : console.log('out folder not found, copying files.');
  copyDir('./templates', outputFolder);
  copyDir(configFolder, path.join(outputFolder, '.mockatron'));
  // Replace routes file
  let routesFileContent: string = fs.readFileSync(
    path.join(outputFolder, 'router.js'),
    'utf-8'
  );
  routesFileContent = routesFileContent.replace(
    '// Auto generated Code',
    routesString
  );
  fs.writeFileSync(path.join(outputFolder, 'router.js'), routesFileContent);

  // Replace main file
  let indexFileContent: string = fs.readFileSync(
    path.join(outputFolder, 'index.js'),
    'utf-8'
  );
  indexFileContent = indexFileContent.replace('CONTEXT_PATH', contextPath);
  if (requests.proxy) {
    const proxyString = `app.use(proxy('${requests.proxy}'))`;
    indexFileContent = indexFileContent.replace(
      '// PROXYING_SUPPORT',
      proxyString
    );
  }
  fs.writeFileSync(path.join(outputFolder, 'index.js'), indexFileContent);
};

export const buildMock = (configFolder: string, outputFolder: string) => {
  const parsedMockatronTemplate = TemplateParser(
    fs.readFileSync(path.join(configFolder, 'main.json'), 'utf-8'),
    null
  );
  console.log(parsedMockatronTemplate);
  buildPackage(JSON.parse(parsedMockatronTemplate), configFolder, outputFolder);
  console.log('Done.');
};
