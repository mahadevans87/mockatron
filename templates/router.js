const { Router } = require("express");
const jsonParser = require("body-parser").json();
const {TemplateParser} = require('./parsers/templateParser');
const fs = require("fs");

const router = Router();
router.use(jsonParser);


// Auto generated Code


module.exports = router;