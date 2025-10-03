/**
 * Function to set `textContext` for an element
 * @param {string} query 
 * @returns 
 */
export function size(query) {
  const element = document.querySelector(query);
  return (size) => {
    if (element) {
      element.style.height = size;
      element.style.width = size;
    } else {
      console.log(size);
    }
  };
}