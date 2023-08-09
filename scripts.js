const translateButton = document.getElementById("translate-button");
const searchInput = document.getElementById("search-input");
const loadingIndicator = document.getElementById("loading");
const errorContainer = document.getElementById("error");
const targetLanguages = ["en", "ru", "ur", "ar", "tr"];

// Event listener for translate button click
translateButton.addEventListener("click", main);

// Event listener for search input keydown
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    main();
  }
});

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

// Function to translate text
async function translateText(sourceText, sourceLang, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
    sourceText
  )}`;

  try {
    const fetchResponse = await fetch(url);
    const responseData = await fetchResponse.json();
    const translatedWordElement = document.getElementById(
      `translated-word-${targetLang}`
    );
    translatedWordElement.textContent = responseData[0][0][0];
  } catch (error) {
    console.error("Error:", error);
    // Re-throw the error to handle it in the parent function (main)
    throw new Error(`translateText ${sourceLang}-${targetLang}: ${error.message}.`); 
  }
}

// Function to fetch "de/het" word
async function fetchDeHetWord(word) {
  const fetchDeHetWord = searchInput.value;

  // Construct the URL for fetching the "de/het" word
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=nl&dt=t&q=the ${fetchDeHetWord}`;

  try {
    const fetchResponse = await fetch(url);
    const responseData = await fetchResponse.json();
    const dehetContainer = document.getElementById("dehet-container");
    dehetContainer.textContent = responseData[0][0][0];

    // Highlight the first word in the "de/het" word
    const firstPageExtract = dehetContainer.textContent.trim();
    const firstWord = firstPageExtract.split(' ')[0];
    dehetContainer.innerHTML = firstPageExtract.replace(firstWord, `<span class="first-word">${firstWord}</span>`);
  } catch (error) {
    console.error("Error:", error);
    // Re-throw the error to handle it in the parent function (main)
    throw new Error(`fetchDeHetWord: ${error.message}.`); 
  }
}
// Function to fetch images
async function fetchImages(query) {
  const API_KEY = "38259307-8733456e700ed630a3379faf0";
  const perPage = 5;
  const URL = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&lang=nl&image_type=photo&safesearch=true&per_page=${perPage}`;

  try {
    const fetchResponse = await fetch(URL);
    const responseData = await fetchResponse.json();

    if (responseData.hits.length > 0) {
      const imagesContainer = document.getElementById("images-container");
      imagesContainer.innerHTML = ""; // Clear existing content

      // Create and append image elements to the images container
      responseData.hits.forEach((hit) => {
        const imgElement = document.createElement("img");
        imgElement.src = hit.webformatURL;
        imgElement.alt = hit.tags;
        imgElement.classList.add("image");
        imagesContainer.appendChild(imgElement);
      });
    }
  } catch (error) {
    console.error("Error:", error);
    // Re-throw the error to handle it in the parent function (main)
    throw new Error(`fetchImages: ${error.message}.`); 
  }
}


// Function to fetch Wikipedia article
async function fetchArticle(query, lang) {
  const URL = `https://${lang}.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts&format=json&exintro=&titles=${encodeURIComponent(
    query
  )}`;

  try {
    const fetchResponse = await fetch(URL);
    const responseData = await fetchResponse.json();

    const queryPages = responseData.query.pages;
    const pageKeys = Object.keys(queryPages);

    // Check if there are any pages
    if (pageKeys.length > 0) {
      const firstPageId = pageKeys[0];
      const firstPageExtract = queryPages[firstPageId].extract;

      const articleContainer = document.getElementById("article-container");
      articleContainer.innerHTML = firstPageExtract;

      // Find all <li> elements within the article container
      const listElements = document.querySelectorAll("#article-container li");

      // Iterate over each <li> element
      listElements.forEach((listElement) => {
        const listElementText = listElement.textContent;
        const listElementWords = listElementText
          .split(/(\b|\s+|[()]|[,]|[-])(?<!\w-)(?!\s+)/)
          .filter(Boolean);

        let linkTextWords = [];
        const stopWords = ["),", ")", ",", "-"];
        let hasStopElement = false;

        // Check if the words contain stop elements or if the length is less than 4
        if (listElementWords.some((word) => stopWords.includes(word)) || listElementWords.length < 4) {
          const linkElement = document.createElement("a");
          linkElement.id = "wiki-link";
          linkElement.style.textDecoration = "underline";
          linkElement.style.cursor = "pointer";
          linkElement.style.color = "#48bed8";

          // Iterate over each word
          for (const word of listElementWords) {
            if (stopWords.includes(word)) {
              hasStopElement = true;

              // Handle different stop elements
              if (word === "-") {
                linkTextWords.pop(); // Remove the space before hyphen
              }
              if (word === ")") {
                linkTextWords.push(")");
              }
              if (word === "),") {
                linkTextWords.push(")"); // Add ")" without the comma
              }
              break;
            }
            linkTextWords.push(word);
          }

          const linkWordsText = linkTextWords.join("");
          linkElement.textContent = linkWordsText;
          const modifiedText = listElementText.replace(linkWordsText, linkElement.outerHTML);
          listElement.innerHTML = modifiedText;
          const wikiLinkElement = listElement.querySelector("#wiki-link");

          // Add click event listener to the link element
          wikiLinkElement.addEventListener("click", () => {
            searchInput.value = wikiLinkElement.textContent;
            translateButton.click();
          });
        }
      });
    }
  } catch (error) {
    // Re-throw the error to handle it in the parent function (main)
    throw new Error(`fetchArticle: ${error.message}.`);
  }
}

// Main function to orchestrate async functions
async function main() {
  const sourceText = searchInput.value.trim();

  if (sourceText === "") {
    return;
  }

  const sourceLang = "nl";
  const currentState = { query: sourceText, lang: sourceLang };

  showLoadingIndicator();
  history.pushState(currentState, "", `?q=${sourceText}`);

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
    const sourceLang = lang;

    showLoadingIndicator();

    try {
      const promises = [
        ...targetLanguages.map((targetLang) =>
          translateText(query, lang, targetLang)
        ),
        fetchDeHetWord(query),
        fetchImages(query),
        fetchArticle(query, lang),
      ];

      const results = await Promise.allSettled(promises);

      handleRejectedPromises(results);
      hideLoadingIndicator();
    } catch (error) {
      console.error(error);
      errorContainer.textContent = error;
      errorContainer.style.display = "block";
      hideLoadingIndicator();
    }
  }
};