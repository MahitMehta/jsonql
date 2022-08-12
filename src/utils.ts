const URLRegex = /(http|https):\/\/[A-z0-9-\.]+\.[A-z0-9]{2,}/g;

const replaceAll = (val: string, pattern: string, replace: string) => {
    return val.split(pattern).join(replace);
}

export const isURL = (url: string ) => URLRegex.test(url);

export const switchURL = (getKey:Function, url: string) => {
    url.match(URLRegex).forEach(match => {
        url = replaceAll(url, match, getKey(match, '^'))
    });
    return url; 
}

export const revertURL = (getKey:Function, val: string) => {
    val.match(/\^[0-9]{1,}/g).forEach(match => {
        val = replaceAll(val, match, getKey(match));
    });
    return val;
}