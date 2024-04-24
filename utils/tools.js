export const mySubstring = async (str, len) => {
  const startAddress = str.slice(0, len);
  const endAddress = str.slice(str.length - len, str.length);
  return `${startAddress}...${endAddress}`;
};

export const isLoading = async (dom, flag = true) => {
  dom.style.display = flag ? "flex" : "none";
};
