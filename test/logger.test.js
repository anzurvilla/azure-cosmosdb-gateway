// ❄️🌀📘📜📄💠➡️🔸🔘🔵🏁🚩🔅❓☑️📛⛔️⚠️🚧📍📌📥📧🔖🆘❗️❕
console.log('\x1b[30m',`something `,'\x1b[0m');
console.log('\x1b[45m',`something `,'\x1b[0m');

describe('Logger', () => {
    
    const logger = require('../src/utils/logger');

    it('Print logs test', () => {
        logger.printVerbose('Verbose');
        logger.printInfo('Info');
        logger.printSuccess('Success');
        logger.printWarning('Warning');
        logger.printError('Error');
    });

});