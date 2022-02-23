import { randomInt, randomUUID } from 'crypto';
import { Request } from 'express';
import { EOL } from 'os';
import handlebars from 'handlebars';
import {
  generateParagraphs,
  generateWords,
  generateSentences,
} from '../utils/stringGenerator';
const TemplateParserImpl = (request: Request) => {
  return {
    // repeat helper from Dummy JSON library
    array: (min: number, max: number, options: any) => {
      let content = '';
      let count = 0;
      const data = { ...options };
      // If given two numbers then pick a random one between the two
      count = randomInt(min, max);

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
          } else if (
            i === count - 1 &&
            content.charAt(content.length - 1) === ','
          ) {
            content = content.slice(0, -1);
          }
          content += EOL;
        }
      }
      return content;
    },

    word: (count: number) => generateWords(count),
    sentence: (count: number) => generateSentences(count),
    paragraph: (count: number) => generateParagraphs(count),

    boolean: () => Math.random() < 0.5,
    int: (...args) => {
      const options: { min?: number; max?: number; precision?: number } = {
        precision: 1,
      };

      if (args.length >= 2 && typeof args[0] === 'number') {
        options.min = args[0];
      }
      if (args.length >= 3 && typeof args[1] === 'number') {
        options.max = args[1];
      }
      return randomInt(options.min, options.max);
    },
    float: (...args) => {
      const options: { min?: number; max?: number; precision?: number } = {
        precision: Math.pow(10, -10),
      };
      if (args.length >= 2 && typeof args[0] === 'number') {
        options.min = args[0];
      }
      if (args.length >= 3 && typeof args[1] === 'number') {
        options.max = args[1];
      }
      return Math.random() * (options.max - options.min) + options.min;
    },

    query: (queryStr: any) => {
      return `req.query.${queryStr}`;
    },
    path: (pathStr: any) => {
      return `req.params.${pathStr}`;
    },
    body: (bodyStr: any) => {
      return `req.body.${bodyStr}`;
    },

    queryValue: (queryStr: any) => {
      return request.query[`${queryStr}`];
    },
    pathValue: (pathValue: any) => {
      return request.params[`${pathValue}`];
    },
    bodyValue: (bodyValue: any) => {
      return request.body[`${bodyValue}`];
    },

    gt: (expr1: any, expr2: any) => {
      return `${expr1} > ${expr2}`;
    },
    lt: (expr1: any, expr2: any) => {
      return `${expr1} < ${expr2}`;
    },
    neq: (expr1: any, expr2: any) => {
      if (typeof expr2 === 'string') {
        expr2 = `'${expr2}'`;
      }

      return `${expr1} !== ${expr2}`;
    },
    eq: (expr1: any, expr2: any) => {
      if (typeof expr2 === 'string') {
        expr2 = `'${expr2}'`;
      }

      return `${expr1} === ${expr2}`;
    },

    and: (expr1: any, expr2: any) => {
      return `(${expr1}) && (${expr2})`;
    },
    or: (expr1: any, expr2: any) => {
      return `(${expr1}) || (${expr2})`;
    },

    if: (expr1: any) => {
      return `if ${expr1} {`;
    },

    uuid: () => randomUUID(),

    def: (filename: string, objectName: string) => {
      if (objectName) {
        return `JSON.parse(TemplateParser(fs.readFileSync('./.mockatron/' + '${filename}' + '.json', 'utf-8'), req))['${objectName}']`;
      } else {
        return `JSON.parse(TemplateParser(fs.readFileSync('./.mockatron/' + '${filename}' + '.json', 'utf-8'), req))`;
      }
    },
    file: (filename: string) => {
      if (filename) {
        return `JSON.parse(fs.readFileSync('./.mockatron/' + '${filename}' + '.json', 'utf-8'))`;
      } else {
        throw new Error('filename not found in arg');
      }
    },
    proxy: (host: any) => {
      if (host) {
        return new handlebars.SafeString(
          `proxy('${host}', {proxyReqPathResolver: (req) => { return req.originalUrl; }, })(req, res);`
        );
      } else {
        throw new Error('host not found');
      }
    },
  };
};

export const TemplateParser = (content: string, request: Request): string => {
  try {
    return handlebars.compile(content, { noEscape: true })(null, {
      helpers: TemplateParserImpl(request),
    });
  } catch (error) {
    console.error(`Error while parsing the template: ${error.message}`);
    throw error;
  }
};
