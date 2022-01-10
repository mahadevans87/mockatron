import  inputConfig from './test.json'

import { copyDir } from './utils/functions';
import * as fs from "fs";

import { IResponse, IRoute, IConstraint } from './models/IRoute';
import { MOCKATRON_CONSTRAINT_CONDITION_NOT_EQ, MOCKATRON_CONSTRAINT_UNDEFINED, MOCKATRON_CONSTRAINT_TYPE_CONSTRAINT, MOCKATRON_CONSTRAINT_TYPE_VALUE } from './utils/utils';
import {TemplateParser} from './parsers/templateParser';

const parseExpressionValue = (expressionValue: string): string => {
  if (!expressionValue || expressionValue.length === 0) {
    throw new Error(`Expression Value cannot be null - ${expressionValue}`);
  }

  // query param
  if (expressionValue.startsWith('query(')) {
    return `req.query.${expressionValue.slice(6, -1)}`
  }
  if (expressionValue === MOCKATRON_CONSTRAINT_UNDEFINED) {
    return `undefined`
  }
  return expressionValue;
}

const parseConstraint = (constraint: IConstraint): string => {

  let operator: string;
  let expression1: string;
  let expression2: string;

  switch (constraint.operator) {
    case MOCKATRON_CONSTRAINT_CONDITION_NOT_EQ:
      operator = '!=='
      break;
      default:
      break;
  }

  if (constraint.expression1.type === MOCKATRON_CONSTRAINT_TYPE_CONSTRAINT) {
    expression1 = parseConstraint(constraint.expression1 as IConstraint);
  } else {
    expression1 = parseExpressionValue(constraint.expression1.value);
  }

  if (constraint.expression2.type === MOCKATRON_CONSTRAINT_TYPE_CONSTRAINT) {
    expression2 = parseConstraint(constraint.expression2 as IConstraint);
  } else {
    expression2 = parseExpressionValue(constraint.expression2.value);
  }

  return `(${expression1} ${operator} ${expression2})`;

}

const parseRouteResponse = (response: IResponse, definitions: any): string => {
  let routeResponse = '';

  if (response.constraint) {
    routeResponse = `if ${parseConstraint(response.constraint)} {\n`;
  }

  // body can be in def(body) or file(body) -> this one is for the future if the JSON grows bigger
  let responseBody = response.body;
  if (response.body.startsWith('def(')) {
    responseBody = definitions[response.body.slice(4, -1)]
  }


  routeResponse = `${routeResponse} return res.status(${response.statusCode}).json(${JSON.stringify(responseBody)}) \n`;
  if (response.constraint) {
    routeResponse = `${routeResponse}}\n`;
  }

  return routeResponse;
}

const parseRouteResponses = (responses: Array<IResponse>, definitions: any) => responses.map(response => parseRouteResponse(response, definitions));

const parseRoute = (route: IRoute, definitions: any) => {
  const routeContents = parseRouteResponses(route.responses, definitions).join('\n\n');
  return `router.${route.method.toLowerCase()}('${route.path}', (req, res) => {${routeContents}});`;
}


const parseRoutes = (routes: any, definitions: any) =>  routes.map(route => parseRoute(route, definitions));

const buildPackage = (requests: any) => {
  const contextPath = requests.contextPath;
  const routesString =  parseRoutes(requests.routes, requests.definitions).join('\n\n');

  // Create a new directory and copy template files
  fs.existsSync('./out') ? fs.rmSync('./out', { recursive: true }) : console.log('out folder not found, copying files.');
  copyDir('./templates', './out');

  // Replace routes file
  let routesFileContent: string = fs.readFileSync('./out/router.js', 'utf-8');
  routesFileContent =  routesFileContent.replace('// Auto generated Code', routesString);
  fs.writeFileSync('./out/router.js', routesFileContent);

  // Replace main file
  let indexFileContent: string = fs.readFileSync('./out/index.js', 'utf-8');
  indexFileContent = indexFileContent.replace('/context-path', contextPath);
  fs.writeFileSync('./out/index.js', indexFileContent);
}

const something = TemplateParser(fs.readFileSync('./src/test-copy.txt', 'utf-8'), null);
console.log(something);

//buildPackage(inputConfig);
console.log("Done.");