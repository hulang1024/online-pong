export function parseSearchParams() {
  if (!location.search) {
    return {};
  }
  const pairs = location.search.substring(1).split('&');
  return pairs.reduce((obj: any, pair) => {
    const [ k, v ] = pair.split('=');
    obj[k] = v;
    return obj;
  }, {});
}