import { sourceText, sourceLang, translateButton, searchInput } from './constants.js';
import { main } from './main.js';

// Event listener for translate button click
translateButton.addEventListener("click", main);

// Event listener for search input keydown
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (sourceText === "") {
      return;
    }
    main(sourceText, sourceLang);
  }
});