export const getKeywords = (str) => {
  let keywords = [];
  let temp = "";
  for (let i = 0; i < str.length; i++) {
    temp = temp + str[i];
    keywords.push(temp);
  }
  return keywords;
};
