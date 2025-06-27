import fs from 'fs';
import path from 'path';

function matches(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    for (const key of keys1) {
      if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
        return false;
      }
    }
  
    return true;
}

function getCacheKey(id, type) {
  return `${id}-${type}`;
}

async function putCache(key, value) {

  const cacheDir = path.join(import.meta.dirname, 'cache');
  const cacheFile = path.join(cacheDir, `${key}.json`);

  if(value instanceof Promise) {
    value = await value;
  }

  if(value instanceof Response) {
    console.log('response');
    value = await value.json();
  }

  fs.writeFileSync(cacheFile, JSON.stringify(value, null, 2));

  return value;
}

function getCache(key) {
  const cacheDir = path.join(import.meta.dirname, 'cache');
  const cacheFile = path.join(cacheDir, `${key}.json`);

  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }

  return null;
}

function cache(key, value) {
  if(getCache(key)) {
    return getCache(key);
  }

  return putCache(key, value);
}

export { matches, putCache, getCache, cache, getCacheKey };