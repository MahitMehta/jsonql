import invert from "lodash/invert";
import cloneDeep from "lodash/cloneDeep";
import { isURL, revertURL, switchURL } from "./utils";

export interface JsonQLObject {
    registry: {
        [ key: string ]: string; 
    },
    data: object;
}

export interface JsonQLOptions {
    links?: boolean; 
}

export class JsonQL {
    private counter = { 
        key: 1,
        repeat: 0
    }

    private readonly MAX_STACK_SIZE = 1000;
    private stackCounter = 0; 

    private registry:{ [ key: string ]: string } = {} 
    private readonly options:JsonQLOptions;  

    constructor(options:JsonQLOptions = {}) {
        this.options = options; 
    }

    public async mini<T extends object>(object: T) : Promise<JsonQLObject> {
        const data = Array.isArray(object) ? 
            await this.addToStack(this.switchArray, object, this.getNextKey.bind(this)) : 
            await this.addToStack(this.switchObject, object, this.getNextKey.bind(this));

        return { data, registry: this.registry }
    }

    public async revert<T extends object>(object:JsonQLObject) : Promise<T> {
        this.registry = invert(cloneDeep(object.registry));
        const data = Array.isArray(object.data) ? 
            await this.addToStack(this.switchArray, object.data, this.injectKey.bind(this)) : 
            await this.addToStack(this.switchObject, object.data, this.injectKey.bind(this));
        
        return data; 
    }
    
    /**
     *  Returns true if object will shrink due to compression, else false.
     * @param object
     */
    public static validateJSON<T extends object>(object:T) {   
        const mini = new JsonQL().mini(object);
        const miniSize =  new TextEncoder().encode(JSON.stringify(mini)).length;
        const orginalSize = new TextEncoder().encode(JSON.stringify(object)).length;
        return miniSize < orginalSize;
    }

    private async switchObject<T extends object>(object: T,  getKey:Function) {
        const switchedObject = {};
        getKey.apply(this);

        for (let [ key, val ] of Object.entries(object)) {
            const isArray = Array.isArray(val); 
            const isNull = val === null;
            const isValidURL = this.options.links && typeof val === 'string' && isURL(val); 
            const identifer = isValidURL ? "^" : "";
            const switchedKey = getKey(key, identifer);

            if (typeof val === "object" && !isArray && !isNull) {
                const subobject = val;
                switchedObject[switchedKey] = await this.addToStack(this.switchObject, subobject, getKey);
            } else if (isArray) {
                switchedObject[switchedKey] = await this.addToStack(this.switchArray, val, getKey);
            } else {
                if (key.startsWith("^")) val = revertURL(getKey, val);
                switchedObject[switchedKey] = isValidURL ? switchURL(getKey, val) : val;
            }
        }
        return switchedObject
    }

    private async switchArray(object:any, getKey:Function) {
        getKey.apply(this);
        return await Promise.all(await object.map(async (item:any) => {
            if (Array.isArray(item)) return await Promise.all(await this.addToStack(this.switchArray, item, getKey));
            else if (typeof item === "object") return await this.addToStack(this.switchObject, item, getKey);
            else return item; 
        }));
    }

    private injectKey(miniKey:string) : string {
        return this.registry[miniKey];
    };

    private getNextKey(oldKey:string, identifer: string = "") : string {
        if (oldKey === undefined) return; 
        const nextKey = `${identifer}${this.counter.repeat || ''}${this.counter.key}`;
        if (this.registry[oldKey] !== undefined) return this.registry[oldKey]
        this.registry[oldKey] = nextKey;
        if (this.counter.key > 8) {
            this.counter.key = 0; 
            this.counter.repeat += 1;
        } else this.counter.key += 1;

        return nextKey;
    }

    private async addToStack(cb: Function, ...params:any[]) {
        this.stackCounter++;
        if (this.stackCounter > this.MAX_STACK_SIZE) {
            this.stackCounter = 0;

            return await new Promise((resolve) => {
                process.nextTick(async () => {
                    resolve(await cb(this, ...params));
                });
            }); 
        }
        return await cb.call(this, ...params);
    }
}

export default JsonQL;