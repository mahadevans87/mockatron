import { requests } from './test'
import { copyDir } from './utils/functions';
import * as fs from "fs";

import { IResponse, IRoute, IConstraint } from './models/IRoute';
import { MOCKATRON_CONSTRAINT_CONDITION_NOT_EQ, MOCKATRON_CONSTRAINT_NULL, MOCKATRON_CONSTRAINT_TYPE_CONSTRAINT, MOCKATRON_CONSTRAINT_TYPE_VALUE } from './utils/utils';

const parseExpressionValue = (expressionValue: string): string => {
  if (!expressionValue || expressionValue.length === 0) {
    throw new Error(`Expression Value cannot be null - ${expressionValue}`);
  }

  // query param
  if (expressionValue.startsWith('mq__')) {
    return `req.query.${expressionValue.split('mq__')[1]}`
  }
  if (expressionValue === MOCKATRON_CONSTRAINT_NULL) {
    return `null`
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

const parseRouteResponse = (response: IResponse): string => {
  let routeResponse = '';

  if (response.constraint) {
    routeResponse = `if ${parseConstraint(response.constraint)} {\n`;
  }
  routeResponse = `${routeResponse} return res.status(${response.statusCode}).json(${JSON.stringify(response.body)}) \n`;
  if (response.constraint) {
    routeResponse = `${routeResponse}}\n`;
  }

  return routeResponse;
}

const parseRouteResponses = (responses: Array<IResponse>) => responses.map(response => parseRouteResponse(response));

const parseRoute = (route: IRoute) => {
  const routeContents = parseRouteResponses(route.responses).join('\n\n');
  return `router.${route.method.toLowerCase()}('${route.path}', (req, res) => {${routeContents}});`;
}


const parseRoutes = (routes: any) =>  routes.map(route => parseRoute(route));

const buildPackage = (requests: any) => {
  const contextPath = requests.contextPath;
  const routesString =  parseRoutes(requests.routes).join('\n\n');
  
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


//console.log(requests);
const requestObject = JSON.parse(requests)
buildPackage(requestObject);
