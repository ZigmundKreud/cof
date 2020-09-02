/**
 *  Logger object which centralizes logging methods and logging levels
 */
export class Logger {

    /**
     * Logging method which only logs messages if message logLevel is enabled
     * @param msg
     */
    static log(msg, logLevel) {
        const prefixMsg = `${System.logPrefix} | ${msg}`;
        if (logLevel <= System.logLevel) {
            switch (logLevel) {
                case LogLevel.ERROR : console.error(prefixMsg); break;
                case LogLevel.WARN : console.warn(prefixMsg); break;
                case LogLevel.INFO : console.info(prefixMsg); break;
                case LogLevel.DEBUG : console.debug(prefixMsg); break;
            }
        }
        else {
            console.debug(msg);
        }
    }

    static error(msg) {
        this.log(msg, LogLevel.ERROR);
    }

    static info(msg) {
        this.log(msg, LogLevel.INFO);
    }

    static warn(msg) {
        this.log(msg, LogLevel.WARN);
    }

    static debug(msg) {
        this.log(msg, LogLevel.DEBUG);
    }

    /**
     * Lists properties of a given object.
     * @param obj The object to display
     */
    static dump(obj) {
        for (const [key, value] of Object.entries(obj)) {
            console.log(`${key}: ${value}`);
        }
    }
}
