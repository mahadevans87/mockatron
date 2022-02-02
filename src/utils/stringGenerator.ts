import { LoremIpsum } from "lorem-ipsum";

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 8,
      min: 4
    },
    wordsPerSentence: {
      max: 16,
      min: 4
    }
});

export const generateWords = (wordCount: number) => lorem.generateWords(wordCount);
export const generateSentences = (sentenceCount: number) => lorem.generateSentences(sentenceCount).replace(/[\n\r]/g, '\\n');
export const generateParagraphs = (paraCount: number) => lorem.generateParagraphs(paraCount).replace(/[\n\r]/g, '\\n');