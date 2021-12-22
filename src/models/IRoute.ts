export interface IConstraintExpression {
    type: string,
    value: IConstraintExpression | string
}

export interface IConstraint {
    expression1?: IConstraint,
    operator?: string,
    expression2?: IConstraint,
    type: string,
    value?: string
}

export interface IResponse {
    statusCode: number,
    body: any,
    constraint?: IConstraint
}

export interface IRoute {
    path: string,
    method: string,
    responses: Array<IResponse>
}