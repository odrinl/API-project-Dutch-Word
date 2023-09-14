import { sourceLang, translateButton, searchInput } from './constants.js';
import { main } from './main.js';

// Event listener for translate button click
translateButton.addEventListener("click", () => {
  const sourceText = searchInput.value.trim();
  main(sourceText, sourceLang);
});

// Event listener for search input keydown
searchInput.addEventListener("keydown", (event) => {
  const sourceText = searchInput.value.trim();
  if (event.key === "Enter") {
    if (sourceText === "") {
      return;
    }
    main(sourceText, sourceLang);
  }
});