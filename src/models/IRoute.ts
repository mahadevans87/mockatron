export interface IResponse {
    statusCode: number,
    body: string,
    constraint?: any
}

export interface IRoute {
    path: string,
    method: string,
    responses: IResponse[]
}