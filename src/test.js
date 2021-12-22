import {q, MOCKATRON_CONSTRAINT_AND, 
    MOCKATRON_CONSTRAINT_TYPE_VALUE, 
    MOCKATRON_CONSTRAINT_CONDITION_NOT_EQ, 
    MOCKATRON_CONSTRAINT_NULL,
    MOCKATRON_CONSTRAINT_TYPE_CONSTRAINT} from './utils/utils';

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
    }
]`;



export const requests = `
    {
        "contextPath": "/api/mock",
        "routes": [
            {
                "path": "/products",
                "method": "GET",
                "responses": [
                    {
                        "statusCode": "200",
                        "body": ${productList}
                    },
                    {
                        "constraint": {
                            "type": "${MOCKATRON_CONSTRAINT_TYPE_CONSTRAINT}",
                            "expression1": {
                                "type": "${MOCKATRON_CONSTRAINT_TYPE_VALUE}",
                                "value": "${q('search')}"
                            },
                            "operator": "${MOCKATRON_CONSTRAINT_CONDITION_NOT_EQ}",
                            "expression2": {
                                "type": "${MOCKATRON_CONSTRAINT_TYPE_VALUE}",
                                "value": "${MOCKATRON_CONSTRAINT_NULL}"
                            }
                        },
                        "statusCode": 200,
                        "body": ${searchResults}
                    }
                ]
            }
        ]
    }
`;