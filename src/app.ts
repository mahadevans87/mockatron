import { requests } from './mockatron'
import { IResponse, IRoute, IConstraint } from './models/IRoute';
import { MOCKATRON_CONSTRAINT_CONDITION_NOT_EQ, MOCKATRON_CONSTRAINT_TYPE_CONSTRAINT, MOCKATRON_CONSTRAINT_TYPE_VALUE } from './utils/utils';

const parseConstraint = (constraint: IConstraint) => {

  let operator;
  let constraintString;
  
  switch (constraint.operator) {
    case MOCKATRON_CONSTRAINT_CONDITION_NOT_EQ:
      operator = '!=='
      break;
      default:
      break;
  }

  if (constraint.expression1.type === MOCKATRON_CONSTRAINT_TYPE_CONSTRAINT) {
    return `(${parseConstraint(constraint.expression1 as IConstraint)} )`
  }

}

const parseRouteResponse = (response: IResponse) => {
  if (response.constraint) {
  }
}

const parseRouteResponses = (responses: Array<IResponse>) => responses.map(response => parseRouteResponse(response));

const parseRoute = (route: IRoute) => {
  const routeContents = parseRouteResponses(route.responses);

  const routeDefinitionStart = `app.${route.method.toLowerCase()}('${route.path}', (req, res) => {${routeContents}});`;
}


const parseRoutes = (routes: any) =>  routes.map(route => parseRoute(route));

const parseRequests = (requests: any) => {
  const contextPath = requests.contextPath;
  console.log(contextPath);

  parseRoutes(requests.routes);
}



const requestObject = JSON.parse(requests)
parseRequests(requestObject);