// Vulnerable: Unsafe recursive object deep merge susceptible to Prototype Pollution (CWE-1321)
export function deepMerge(target: any, source: any): any {
  for (const key of Object.keys(source)) {
    // Unsafe: does not sanitize __proto__, constructor, or prototype properties
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
    target[key] = source[key];
  }
  return target;
}
