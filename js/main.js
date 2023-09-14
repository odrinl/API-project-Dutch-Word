import { translateText } from './translateText.js';
import { fetchDeHetWord } from './fetchDeHetWord.js';
import { fetchImages } from './fetchImages.js';
import { fetchArticle } from './fetchArticle.js';
import { loadingIndicator, errorContainer, targetLanguages } from './constants.js';

// Display loading indicator
function showLoadingIndicator() {
  loadingIndicator.style.display = "block";
  errorContainer.style.display = "none";
}

// Hide loading indicator
function hideLoadingIndicator() {
  loadingIndicator.style.display = "none";
}

// Display error messages
function displayErrorMessages(errorMessages) {
  errorContainer.innerText = errorMessages.join("\n");
  console.error("Errors:", errorMessages.join("\n"));
  errorContainer.style.display = "block";
  hideLoadingIndicator();
}

// Handle rejected promises
function handleRejectedPromises(results) {
  const errorMessages = [];
  const rejectedPromiseIndices = results
    .map((result, index) => ({ result, index }))
    .filter(({ result }) => result.status === "rejected")
    .map(({ index }) => index);

  if (rejectedPromiseIndices.length > 0) {
    rejectedPromiseIndices.forEach((index) => {
      const errorMessage = `Error in function [${index}] ${
        results[index].reason.message
      }`;
      errorMessages.push(errorMessage);
    });
    displayErrorMessages(errorMessages);
  }
}

let isNavigating = false;
// Main function to orchestrate async functions
export async function main(sourceText, sourceLang) {
  showLoadingIndicator();
  if (!isNavigating) {
  history.pushState({ query: sourceText, lang: sourceLang }, "", `?q=${sourceText}`);
  }
  try {
    const promises = [
      ...targetLanguages.map((targetLang) =>
        translateText(sourceText, sourceLang, targetLang)
      ),
      fetchDeHetWord(sourceText),
      fetchImages(sourceText),
      fetchArticle(sourceText, "nl"),
    ];

    const results = await Promise.allSettled(promises);

    handleRejectedPromises(results);
    hideLoadingIndicator();
    isNavigating = false;
  } catch (error) {
    console.error(error);
    errorContainer.textContent = error;
    errorContainer.style.display = "block";
    hideLoadingIndicator();
  }
}

// Event listener for popstate event
window.onpopstate = async function (event) {
  if (event.state) {
    const { query, lang } = event.state;
    searchInput.value = query;
    isNavigating = true;
    await main(query, lang); // Reuse the main function with the new query and lang
  }
};
