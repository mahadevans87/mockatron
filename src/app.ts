import { requests } from '../res/.mockatron'

const parseRequests = (requests: any) => {
  const contextPath = requests.contextPath;
  console.log(contextPath);
}



const requestObject = JSON.parse(requests)
parseRequests(requestObject);