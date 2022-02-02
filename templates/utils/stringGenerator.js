"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateParagraphs = exports.generateSentences = exports.generateWords = void 0;
const lorem_ipsum_1 = require("lorem-ipsum");
const lorem = new lorem_ipsum_1.LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
});
const generateWords = (wordCount) => lorem.generateWords(wordCount);
exports.generateWords = generateWords;
const generateSentences = (sentenceCount) => lorem.generateSentences(sentenceCount).replace(/[\n\r]/g, '\\n');
exports.generateSentences = generateSentences;
const generateParagraphs = (paraCount) => lorem.generateParagraphs(paraCount).replace(/[\n\r]/g, '\\n');
exports.generateParagraphs = generateParagraphs;
//# sourceMappingURL=stringGenerator.js.map