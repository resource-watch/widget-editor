/**
 * Capitalize the string
 * @param {string} string String to Capitalize
 */
export const capitalize = (string) => {
  if (!string || !string.length) {
    return string;
  }

  // Some non latin characters, when put in uppercase,
  // can't be rendered correctly
  const firstCharCode = string.charCodeAt(0);
  // 592 corresponds to 0x0250 which is the start of the
  // IPA extensions in unicode:
  // https://unicode-table.com/en/blocks/ipa-extensions/
  if (firstCharCode >= 592) {
    return string;
  }

  return string[0].toUpperCase() + string.slice(1, string.length);
};
