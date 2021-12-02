const productList = `[
    {
        "id": "product1",
        "name": "Product One"
    },
    {
        "id": "product2",
        "name": "Product Two"
    },
    {
        "id": "product3",
        "name": "Product Three"
    }

]`;


const searchResults = `[
    {
        "id": "product10",
        "name": "Product Ten"
    },
    {
        "id": "product11",
        "name": "Product Eleven"
    },
]`;

const q = queryStr => `mq__${queryStr}`;
const MOCKATRON_CONSTRAINT_AND = `mc__AND`;
const MOCKATRON_CONSTRAINT_TYPE_VALUE = `mc__CONSTRAINT-TYPE-VALUE`;
const MOCKATRON_CONSTRAINT_CONDITION_NOT_EQ = `mc__CONSTRAINT-NOT-EQ`;
const MOCKATRON_CONSTRAINT_NULL = `mc__CONSTRAINT-NULL`;

export.requests = `
    {
        "contextPath": "/api/mock",
        "routes": [
            {
                "path": "/products",
                "method": "GET",
                "responses": [
                    {
                        "statusCode": 200,
                        "body": ${productList}
                    },
                    {
                        "constraint": {
                            "expression1": {
                                "type": "${MOCKATRON_CONSTRAINT_TYPE_VALUE}",
                                "value": "${q('search')}",
                            },
                            "operator": "${MOCKATRON_CONSTRAINT_CONDITION_NOT_NULL}",
                            "expression2": {
                                "type": "${MOCKATRON_CONSTRAINT_TYPE_VALUE}",
                                value "${MOCKATRON_CONSTRAINT_NULL}",
                            },
                        },
                        "statusCode": 200,
                        "body": ${searchResults}
                    }
                ]
            }
        ]
    }
`;