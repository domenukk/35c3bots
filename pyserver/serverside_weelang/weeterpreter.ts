import * as compiler from "../../client/src/language/Compiler"
import {VirtualMachine, VirtualMachineState} from "../../client/src/language/VirtualMachine";

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

    return externals;
}

export function wee_exec(code: string){
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
    wee_exec(wee)
}