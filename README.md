Simple Library to minify JSON objects for faster data transfers. This is achieved by recursively replacing repetitive, long keys with small and compact keys. The original keys are still retained in the return object and with the `.revert(object)` instance method you can revert the object to its unminified state. 

# When to use
- When you have repetitive, long keys in your JSON object.

- When you are building static pages or using SSR for your website and you are injecting large amounts of JSON into you HTML file. 
  For example, In a Next.js app while SSG/SSR you might want to use JsonQL to reduce the overall size of the HTML File.

# When not to use
 - When you have lots of different keys that are unique throughout the object
 - When the object has very few keys and is overall small in size
 
# Experiment

To try out if this library is useful, you can send a POST request to this endpoint [jsonql.mahitm.com/api/jsonql?minify=true](jsonql.mahitm.com/api/jsonql?minify=true) with a valid JSON body. If you would like to compare the size of the JSON object before and after using the library, you can switch the query parameter `minify` to true or false. 
 
# Demo 

```ts
import JsonQL from "@mahitm/jsonql";

// Assume you have a bunch of books in your store
// with many long keys for properties, for example, "bookSerialNumber"

const store = {
  books: [
    {
      bookSerialNumber: 122132,
      ...
    },
    {
      bookSerialNumber: 142132,
      ...
    },
    ...
  ]
}

// minify store object
const minifiedStore = new JsonQL().mini(store);

// unminify store object
const unminifiedStore = new JsonQL().revert(store);
```
 
# Warning
Misusing the library will result in the minified object pontentially being larger in size than the original object.
