import { randomInt } from 'crypto';
import {Request} from 'express';
import { EOL } from 'os';
import { compile as hbsCompile } from 'handlebars';

const TemplateParserImpl = (request: Request ) => {

    return {
        // repeat helper from Dummy JSON library
        repeat: (min: number, max: number, options: any) => {
            let content = '';
            let count = 0;
            const data = { ...options };
            // If given two numbers then pick a random one between the two
            count = randomInt( min, max );

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
        int: (...args) => {
            const options: { min?: number; max?: number; precision?: number } = {
             precision: 1
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
    }
}

export const TemplateParser = (
    content: string,
    request: Request
  ): string => {
    try {
      return hbsCompile(content)(null, {
        helpers: TemplateParserImpl(request)
      });
    } catch (error) {
      console.error(`Error while parsing the template: ${error.message}`);
      throw error;
    }
  };

