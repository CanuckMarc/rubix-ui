import log from "loglevel";

export namespace Helpers {
    export function IsUndefined(thing: any, name: string): Error | undefined {
        if (thing == undefined) {
            log.error(`${name}: uuid cant not be empty`)
            throw Error(`${name}: uuid cant not be empty`)
        }
        return undefined
    }
}




