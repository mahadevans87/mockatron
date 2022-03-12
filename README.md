<p align="center">
    <img src="res/logo.png" width="377" />
</p>

# Mockatron

Mockatron is a simple tool that helps front-end developers and testers setup a quick Mock HTTP API Server without having to write any backend code.

By defining a simple set of configuration rules, you can stand up a mock HTTP server that can return static as well as dynamic response data.

- Configure API Routes by defining constraints 
- JSON style configuration for requests and responses
- Handlebars style templating to support generation of responses from templates. Support for static responses are also available.
- Enable Proxying to mock only specific routes and redirect others to your actual web server.

# Install

`npm i --global mockatron`

To build locally type the following command from the root directory - 

`$ npm install --global .` 

# Usage

`$ mockatron --config /path/to/.mockatron --out /destination/folder`

Once the mock server is generated, `cd` to the output directory.

`$ npm i`   
`$ npm start`


# The .mockatron configuration folder

Create a folder named `.mockatron` in the current working directory. The folder should contain a `main.json` and other json files for resource definitions.

Consider a simple example: 

```
${cwd}/.mockatron
    --> main.json
    --> products.json
    --> static-products.json
```

## The main.json file

Here is an example of a simple `main.json` file

```
{
    "contextPath": "/api/mock",
    "routes": [
        {
            "path": "/products",
            "method": "GET",
            "responses": [
                {
                    "constraint": "{{{and 
                                          (neq (query 'search') undefined) 
                                          (gt (query 'price') 0)
                                   }}}",
                    "statusCode": 200,
                    "body": "{{{def 'products' 'productSearchNEQ'}}}"
                },
                {
                    "body": "'no results found'",
                    "statusCode": 200
                }
            ]
        },
        {
            "path": "/products/:id",
            "method": "GET",
            "responses": [
                {
                    "statusCode": 200,
                    "body": "{{{def 'products' 'productDetail'}}}"
                }
            ]
        },
        {
            "path": "/static-product",
            "method": "GET",
            "responses": [
                {
                    "statusCode": 200,
                    "body": "{{{file 'static-products'}}}"
                }
            ]
        }
    ]
}
```

The `main.json` file is used to define the routes in the API Server. Each route should contain the following keys - 

`path`: The path relative to the domain and the context path (e.g /products/?price=100). Path can be Node.js Express style routes.  
`method`: The HTTP verb (e.g `GET`).  
`responses`: An array of responses that this route could return based on various `constraints` or rules.  

## The Response Object

Each object in the `responses` array should define the following keys - 

`constraint`: A set of rules that evaluate whether to execute the response or not. These are essentially handlebars style templates that can be used. 
              For example, `{{{gt (query 'price') 0}}}` would evaluate whether the query param named `price > 0`. A complete list of helpers is provided below.  
              
`status`: The HTTP Response Status code.  

`body`: The body of the response to be returned. Currently only JSON format is supported. Responses can be static - from a simple text file to dynamic - random        responses based on a set of templates that can be defined. A complete set of documentation on these are provided below.

## Dynamic Resource definitions

Here is a simple example of a `products.json` file that should reside in the same directory as the main.json file.

```
{
    "productSearch": [
          {{#array 5 20}}
            {
              "price": "{{float 50.0 5000.0}}",
              "rating": {{int 1 5}},
              "id": "{{pathValue 'id'}}",
              "name": "{{word 2}}",
              "description": "{{paragraph 3}}",
              "randomId": "{{uuid}}"
            }
          {{/array}}
    ],
}
```

The `productSearch` object was referenced in one of the route responses above in the `main.json` file. Mockatron will evaluate this response template each time it encounters the particular route and constraint and generates a random response based on the template. A complete list of helpers is defined below.

To use the above `productSearch` definition in `main.json`, use the `def` helper like so - 

```
{
    "path": "/products/:id",
    "method": "GET",
    "responses": [
        {
            "statusCode": 200,
            "body": "{{{def 'products' 'productSearch'}}}"
        }
    ]
},
```

## Static Resource Definitions

Static resource can be literally any JSON file that needs to be returned each time the request matches the resource. No computation or random data is generated in this case. The file is returned as-is when the particular constraint matches. 

Create a file named 'static-products.json` for the above example and put it in the same directory as the main.json file.


```
{
    "price": 20.0,
    "rating": 3,
    "id": "sdfas-342sdf-34asf-34asdf-34sxz",
    "name": "This name is never gonna change",
    "description": "This description too is not gonna change.",
    "randomId": "not-really-a-random-Id"
} 
```

To use the above file inside a route response, specify it in the `body` key using the`file` helper.
```
{
            "path": "/static-product",
            "method": "GET",
            "responses": [
                {
                    "statusCode": 200,
                    "body": "{{{file 'static-products'}}}"
                }
            ]
        }
```


## Proxy requests to another server

Mockatron can act as a proxy server on top of your regular backend API server. This can be a powerful tool if you want to mock APIs partially while proxying other requests to a backend server.

### Setup a global proxy 

In the main.json file's root element, add a `proxy` key and specify the host name to proxy any requests that do not match in the `routes` section. For example - 

```
{
    "contextPath": "/api/mockatron",
    "proxy": "http://localhost:8081",
    "routes": [...],
}
```

If Mockatron cannot find a matching route in the `routes` array, it will proxy the request to the host specfied in the `proxy` section (in this case http://localhost:8081. 

### Setup route specfic proxies

Sometimes you may want to proxy to an external API server for specific routes and may not always want to fallback to the global proxy as defined above. In such cases use the `{{proxy <host_name>}}` constraint in the `body` key. As an example - 

```
{
    "contextPath": "/api/mockatron",
    "routes": [
            "path": "/login",
            "method": "GET",
            "responses":[
                "body": "{{ proxy auth.github.com }}
            ]
    ]
}
``` 

In the above example, the `/api/mockatron/login` GET request will be proxied to `auth.github.com`



# Available Constraint Helpers 

Here is a list of constraint helpers that can be used to perform conditional selection of a route based on a request's query param, path param, body param.
You can build a complex constraint by combining several expressions together.

`{{ query query_param }}` - This can be used in conjunction while conditionally checking for the query param named `query_param`

`{{ path path_param }}`   - This can be used in conjunction while conditionally checking for the path param named `path_param`

`{{ body body_param }}`   - This can be used in conjunction while conditionally checking for the body param named `body_param`. The body *must be a json*

`{{ gt expr1 expr2 }}`    - Check if `expr1 > expr2` 

`{{ lt expr1 expr2 }}`    - Check if `expr1 < expr2` 

`{{ eq expr1 expr2 }}`    - Check if `expr1 == expr2` 

`{{ neq expr1 expr2 }}`   - Check if `expr1 != expr2` 

`{{ and expr1 expr2 }}`   - Check if `expr1 && expr2` 

`{{ or expr1 expr2 }}`    - Check if `expr1 || expr2` 


An example of putting it all together - 

```
"constraint": "{{{and 
                    (neq (query 'search') undefined) 
                    (gt (query 'price') 0)
               }}}"
```               
The above constraint basically can be translated like so - `if ((request.query.search != undefined) && (request.query.price > 0))`. Only if this constraint is met, the route response will be evaluated. 

# Available Response Helpers

Here is a list of response helpers that can be used to build dynamic responses each time a route is called.

`{{ int min max }}`         - Generate a random integer between min and max

`{{ float min max }}`       - Generate a random float between min and max

`{{ boolean }}`             - Generate a random boolean  

`{{ word count }}`          - Generate random words based on the count. This can be used for string keys in responses. 

`{{ sentence count }}`      - Generate random sentences based on the count. This can be used for string keys in responses. 

`{{ paragraph count }}`     - Generate random paragraph based on the count. This can be used for string keys in responses. 

`{{ uuid }}`                - Generate a random uuid 

`{{ array min max }}`       - Generate an array of objects based on the enclosing object. The count of the array is a random number between min and max. 

`{{ queryValue query_param }}` - Use the query_param value passed in the request in the response 

`{{ pathValue path_param }}` - Use the path_param value passed in the request in the response 

`{{ bodyValue body_param }}` - Use the body_param value passed in the request in the response  


Putting it all together, here is an example - 

Create a `products.json` file that would contain dynamic response definitions. Let's assume we have a `productDetail` definition that we will use for a route.

```
{
     "productDetail": {
        "price": "{{float 50.0 5000.0}}",
        "rating": {{int 1 5}},
        "id": "{{pathValue 'id'}}",
        "name": "{{word 2}}",
        "description": "{{paragraph 3}}",
        "randomId": "{{uuid}}"
     }   
}
```

To use the above `productDetail` definition in `main.json`, use the `def` helper like so - 

```
{
    "path": "/products/:id",
    "method": "GET",
    "responses": [
        {
            "statusCode": 200,
            "body": "{{{def 'products' 'productDetail'}}}"
        }
    ]
},
```



# TODO
1. Allow filtering output for array definitions e.g filter -> item => item.amount > 10 && item.amount < 20
2. auto generate output (low priority)
3. project -> keys -> 
4. hosting -> take in multiple JSONs and generate server, CRUD 
5. UI -> for generating JSON
6. Github Actions
