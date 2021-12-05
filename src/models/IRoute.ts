export interface IConstraintExpression {
    type: string,
    value: any
}


export interface IConstraint {
    expression1: IConstraint | IConstraintExpression,
    operator: string,
    expression2: IConstraint | IConstraintExpression,
    type: string
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