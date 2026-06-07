const { createRequire } = require('module');

async function test() {
    const pdfParse = require('pdf-parse');
    console.log("type is", typeof pdfParse);
    console.log("default is", typeof pdfParse.default);
    if (typeof pdfParse === 'function') {
        console.log("it is a function");
    } else if (typeof pdfParse.default === 'function') {
        console.log("default is a function");
    } else {
        console.log(Object.keys(pdfParse));
    }
}
test();
