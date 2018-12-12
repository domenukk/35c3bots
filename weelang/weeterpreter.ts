import * as flags from "./flags";
import * as compiler from "../client/src/language/Compiler"
import {VirtualMachine, VirtualMachineState} from "../client/src/language/VirtualMachine";

declare let BigInt: number

function get_headless_externals() {
    const externals = new compiler.ExternalFunctionsTypesConstants();

    // Override browser-dependend alert with console.log
    externals.addFunction(
        "alert",
        [{name: "message", type: compiler.StringType}], compiler.NothingType,
        false,
        (value: string) => {
            console.log(value);
        }
    )
    externals.addFunction(
        "alert",
        [{name: "value", type: compiler.NumberType}], compiler.NothingType,
        false,
        (value: number) => {
            console.log(value)
        }
    )
    externals.addFunction(
        "alert",
        [{name: "value", type: compiler.BooleanType}], compiler.NothingType,
        false,
        (value: string) => {
            console.log(value)
        }
    )

    // pyserver
    externals.addFunction(
        "ord",
        [{name: "value", type: compiler.StringType}], compiler.NumberType,
        false,
        (value: string) => {
            return value.charCodeAt(0) % 256
        }
    )
    externals.addFunction(
        "bigModPow",
        [
            {name: "base", type: compiler.StringType},
            {name: "exponent", type: compiler.StringType},
            {name: "modulus", type: compiler.StringType}
        ], compiler.StringType,
        false,
        (base: string, exponent: string, modulus: string) => {
            //console.log("->bigModPow")
            // @ts-ignore
            let b = BigInt(base)
            // @ts-ignore
            let e = BigInt(exponent)
            // @ts-ignore
            let N = BigInt(modulus)
            //console.log("<-bigModPow",b, e, N)
            // @ts-ignore
            return eval('""+((b ** e) % N)') // force js since tsc translates ** to Math.Pow... *rolls eyes*
        }
    )
    externals.addFunction(
        "strToBig",
        [{name: "str", type: compiler.StringType}], compiler.StringType,
        false,
        (str: string) => {
            // @ts-ignore
            let res = BigInt(0);
            for (const c of str) {
                // @ts-ignore
                res *= BigInt(256)
                // @ts-ignore
                res += BigInt(c.charCodeAt(0)%256)
            }
            return ""+res
        }
    )
    externals.addFunction(
        "eval",
        [{name: "value", type: compiler.StringType}], compiler.NothingType,
        false,
        (value: string) => {
            //TODO: EVAL
            console.log(value)
        }
    )
    externals.addFunction(
        "assert_number",
        [{name: "num", type: compiler.StringType}], compiler.NumberType,
        false,
        (num: number) => num == NaN || num == Infinity || num !== num + 1
            ? "NUMBERS WORK": flags.NUMBER_ERROR
    )
    externals.addFunction(
        "assert_conversion",
        [{name: "str", type: compiler.StringType}], compiler.StringType,
        false,
        (str: string) => str.length === +str+"".length || !/^[1-9]+(\.[1-9]+)?$/.test(str)
            ? "Convert to Pastafarianism": flags.CONVERSION_ERROR
    )
    externals.addFunction(
        // Wee is statically typed. Finding a way to confuse the VM is impossible.
        "assert_string",
        [{name: "str", type: compiler.StringType}], compiler.StringType,
        false,
        (str: string) => typeof str == "string" ? "WEE is statically typed. Sorry, confusing the VM is impossible."
            : flags.WEE_TOKEN
    )
    externals.addFunction(
        "assert_leet",
        [{name: "maybe_leet", type: compiler.NumberType}], compiler.StringType,
        false,
        (maybe_leet: number) => maybe_leet !== 0x1337 ? "WEE AIN'T LEET" : flags.SIMPLE
    )
    return externals;
}

export function wee_exec(code: string) {
    try {
        const compiled = compiler.compile(code, get_headless_externals())
        const vm = new VirtualMachine(compiled.functions, compiled.externalFunctions)
        while (vm.state != VirtualMachineState.Completed) {
            vm.run(10000);
        }
        vm.restart();
    } catch (ex) {
        console.error(ex.message)
    }
}


if (require.main === module) {
    const wee = process.argv[2];
    //console.log(wee)
    wee_exec(wee)
}