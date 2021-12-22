import { requests } from './test'
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
  const routeContents = parseRouteResponses(route.responses);
  return `app.${route.method.toLowerCase()}('${route.path}', (req, res) => {${routeContents}});`;
}


const parseRoutes = (routes: any) =>  routes.map(route => parseRoute(route));

const parseRequests = (requests: any) => {
  const contextPath = requests.contextPath;
  return parseRoutes(requests.routes);
}


console.log(requests);
const requestObject = JSON.parse(requests)
console.log(parseRequests(requestObject));