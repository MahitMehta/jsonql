Simple Library to minify JSON objects for faster data transfers. This is achieved by recursively replacing repetitive, long keys with small and compact keys. The original keys are still retained in the return object and with the `.revert(object)` instance method you can revert the object to it's unminified state. 

# When to use
- When you have repetitive, long keys in your JSON object.

# When not to use
 - When you have a lot of different keys that are unique throughout the object
 - When the object has very few keys and is overall small in size
 
# Warning
Misusing the library will result in the minified object pontentially being larger in size than the original object.
