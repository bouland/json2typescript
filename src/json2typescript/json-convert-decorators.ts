import { MappingOptions, Settings } from "./json-convert-options";
import { Any } from "./any";

/**
 * Decorator of a class that is a custom converter.
 *
 * @param target the class
 */
export function JsonConverter(target: any): any {
    target[Settings.MAPPER_PROPERTY] = "";
}

/**
 * Decorator of a class that comes from a JSON object.
 *
 * @param target the class identifier or the class
 *
 * @returns {any}
 *
 * @throws Error
 */
export function JsonObject(target?: string | any): any {
    // target is the constructor or the custom class name

    let classIdentifier = "";

    const decorator = (target: any): void => {
        target.prototype[Settings.CLASS_IDENTIFIER] = classIdentifier.length > 0 ? classIdentifier : target.name;

        const mapping: any = target.prototype[Settings.MAPPING_PROPERTY];
        let newMapping: any = [];

        // Make sure we replace the mapping names of all properties of this class
        if (!mapping) return;

        for (const key of Object.keys(mapping)) {
            const newKey: string = key.replace(Settings.CLASS_IDENTIFIER + ".", target.prototype[Settings.CLASS_IDENTIFIER] + ".");
            newMapping[newKey] = mapping[key];
        }

        target.prototype[Settings.MAPPING_PROPERTY] = newMapping;

    };

    const type: string = typeof target;

    switch (type) {

        // Decorator was @JsonObject(classId)
        case "string":
            classIdentifier = target;
            return decorator;

        // Decorator was @JsonObject
        case "function":
            decorator(target);
            return;

        // Decorator was @JsonObject()
        case "undefined":
            return decorator;

        // Decorator was @JsonObject(123)
        default:

            throw new Error(
                "Fatal error in JsonConvert. " +
                "It's mandatory to pass a string as parameter in the @JsonObject decorator.\n\n" +
                "Use either @JsonObject or @JsonObject(classId) where classId is a string.\n\n"
            );

    }

}

/**
 * Decorator of a class property that comes from a JSON object.
 *
 * The second param can be either a type or a class of a custom converter.
 *
 * Use the following notation for the type:
 * - Primitive type: String|Number|Boolean
 * - Custom type: YourClassName
 * - Array type: [String|Number|Boolean|YourClassName]
 *
 * If you decide to use a custom converter, make sure this class implements the interface JsonCustomConvert from this package.
 *
 * @param jsonPropertyName optional param (default: classPropertyName) the property name in the expected JSON object
 * @param conversionOption optional param (default: Any), should be either the expected type (String|Boolean|Number|etc) or a custom converter class implementing JsonCustomConvert
 * @param isOptional optional param (default: false), if true, the json property does not have to be present in the object
 *
 * @returns {(target:any, classPropertyName:string)=>void}
 *
 * @throws Error
 */
export function JsonProperty(...params: any[]): any {

    return function (target: any, classPropertyName: string): void {
        // target is the class

        let jsonPropertyName: string = classPropertyName;
        let conversionOption: any = Any;
        let isOptional: boolean = false;

        switch (params.length) {
            case 1:
                if (params[0] === undefined) throw new Error(
                    "Fatal error in JsonConvert. " +
                    "It's not allowed to explicitly pass \"undefined\" as first parameter in the @JsonProperty decorator.\n\n" +
                    "\tClass property: \n" +
                    "\t\t" + classPropertyName + "\n\n" +
                    "Leave the decorator parameters empty if you do not wish to pass the first parameter.\n\n"
                );
                jsonPropertyName = params[0];
                break;
            case 2:
                if (params[0] === undefined) throw new Error(
                    "Fatal error in JsonConvert. " +
                    "It's not allowed to explicitly pass \"undefined\" as first parameter in the @JsonProperty decorator.\n\n" +
                    "\tClass property: \n" +
                    "\t\t" + classPropertyName + "\n\n" +
                    "Leave the decorator parameters empty if you do not wish to pass the first parameter.\n\n"
                );
                if (params[1] === undefined) throw new Error(
                    "Fatal error in JsonConvert. " +
                    "It's not allowed to explicitly pass \"undefined\" as second parameter in the @JsonProperty decorator.\n\n" +
                    "\tClass property: \n" +
                    "\t\t" + classPropertyName + "\n\n" +
                    "Use \"Any\" to allow any type. You can import this class from \"json2typescript\".\n\n"
                );
                jsonPropertyName = params[0];
                conversionOption = params[1];
                break;
            case 3:
                if (params[0] === undefined) throw new Error(
                    "Fatal error in JsonConvert. " +
                    "It's not allowed to explicitly pass \"undefined\" as first parameter in the @JsonProperty decorator.\n\n" +
                    "\tClass property: \n" +
                    "\t\t" + classPropertyName + "\n\n" +
                    "Leave the decorator parameters empty if you do not wish to pass the first parameter.\n\n"
                );
                if (params[1] === undefined) throw new Error(
                    "Fatal error in JsonConvert. " +
                    "It's not allowed to explicitly pass \"undefined\" as second parameter in the @JsonProperty decorator.\n\n" +
                    "\tClass property: \n" +
                    "\t\t" + classPropertyName + "\n\n" +
                    "Use \"Any\" to allow any type. You can import this class from \"json2typescript\".\n\n"
                );
                jsonPropertyName = params[0];
                conversionOption = params[1];
                isOptional = params[2];
                break;
            default:
                break;
        }


        if (typeof(target[Settings.MAPPING_PROPERTY]) === "undefined") {
            target[Settings.MAPPING_PROPERTY] = [];
        }

        let jsonPropertyMappingOptions = new MappingOptions();
        jsonPropertyMappingOptions.classPropertyName = classPropertyName;
        jsonPropertyMappingOptions.jsonPropertyName = jsonPropertyName;
        jsonPropertyMappingOptions.isOptional = isOptional ? isOptional : false;

        // Check if conversionOption is a type or a custom converter.
        if (typeof(conversionOption) !== "undefined" && conversionOption !== null && typeof(conversionOption[Settings.MAPPER_PROPERTY]) !== "undefined") {
            jsonPropertyMappingOptions.customConverter = new conversionOption();
        } else {
            jsonPropertyMappingOptions.expectedJsonType = conversionOption;
        }

        // Save the mapping info
        target[Settings.MAPPING_PROPERTY][Settings.CLASS_IDENTIFIER + "." + classPropertyName] = jsonPropertyMappingOptions;

    }

}
