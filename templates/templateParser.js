"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateParser = void 0;
const crypto_1 = require("crypto");
const os_1 = require("os");
const handlebars_1 = require("handlebars");
const TemplateParserImpl = (request) => {
    return {
        // repeat helper from Dummy JSON library
        repeat: (min, max, options) => {
            let content = '';
            let count = 0;
            const data = Object.assign({}, options);
            // If given two numbers then pick a random one between the two
            count = (0, crypto_1.randomInt)(min, max);
            for (let i = 0; i < count; i++) {
                // You can access these in your template using @index, @total, @first, @last
                data.index = i;
                data.total = count;
                data.first = i === 0;
                data.last = i === count - 1;
                // By using 'this' as the context the repeat block will inherit the current scope
                content = content + options.fn(this, { data: data });
                if (options.hash.comma !== false) {
                    // Trim any whitespace left by handlebars and add a comma if it doesn't already exist,
                    // also trim any trailing commas that might be at the end of the loop
                    content = content.trimRight();
                    if (i < count - 1 && content.charAt(content.length - 1) !== ',') {
                        content += ',';
                    }
                    else if (i === count - 1 &&
                        content.charAt(content.length - 1) === ',') {
                        content = content.slice(0, -1);
                    }
                    content += os_1.EOL;
                }
            }
            return content;
        },
        int: (...args) => {
            const options = {
                precision: 1
            };
            if (args.length >= 2 && typeof args[0] === 'number') {
                options.min = args[0];
            }
            if (args.length >= 3 && typeof args[1] === 'number') {
                options.max = args[1];
            }
            return (0, crypto_1.randomInt)(options.min, options.max);
        },
        float: (...args) => {
            const options = {
                precision: Math.pow(10, -10)
            };
            if (args.length >= 2 && typeof args[0] === 'number') {
                options.min = args[0];
            }
            if (args.length >= 3 && typeof args[1] === 'number') {
                options.max = args[1];
            }
            return Math.random() * (options.max - options.min) + options.min;
        },
        query: (queryStr) => {
            return `req.query.${queryStr}`;
        },
        gt: (expr1, expr2) => {
            return `${expr1} > ${expr2}`;
        },
        neq: (expr1, expr2) => {
            return `${expr1} !== ${expr2}`;
        },
        and: (expr1, expr2) => {
            return `(${expr1}) && (${expr2})`;
        },
        if: (expr1) => {
            return `if ${expr1} {`;
        },
        def: (filename, objectName) => {
            return `JSON.parse(TemplateParser(fs.readFileSync('./.mockatron/' + '${filename}' + '.def', 'utf-8')))`;
        }
    };
};
const TemplateParser = (content, request) => {
    try {
        return (0, handlebars_1.compile)(content)(null, {
            helpers: TemplateParserImpl(request)
        });
    }
    catch (error) {
        console.error(`Error while parsing the template: ${error.message}`);
        throw error;
    }
};
exports.TemplateParser = TemplateParser;
//# sourceMappingURL=templateParser.js.map