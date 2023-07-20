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

// Function to handle translation
async function main() {
  const sourceText = searchInput.value.trim();

  // Check if the source text is empty
  if (sourceText === "") {
    return;
  }

  const sourceLang = "nl";

  // Show loading indicator and hide error container
  loadingIndicator.style.display = "block";
  errorContainer.style.display = "none";

  // Save search query to browser history
  const currentState = {
    query: sourceText,
    lang: sourceLang,
  };
  history.pushState(currentState, "", `?q=${sourceText}`);

  try {
    // Call translation, fetch "de/het" word, fetch images, and fetch Wikipedia article in parallel
    await Promise.all([
      ...targetLanguages.map((targetLang) =>
        translateText(sourceText, sourceLang, targetLang)
      ),
      fetchDeHetWord(sourceText),
      fetchImages(sourceText),
      fetchArticle(sourceText, "nl"),
    ]);

    // Hide loading indicator on successful completion
    loadingIndicator.style.display = "none";
  } catch (error) {
    console.error("Error:", error);
    // Show error message to the user
    errorContainer.textContent = "Error: " + error;
    errorContainer.style.display = "block";
    // Hide loading indicator in case of an error
    loadingIndicator.style.display = "none";
  }
}

// Event listener for popstate event
window.onpopstate = async function (event) {
  if (event.state) {
    const { query, lang } = event.state;
    searchInput.value = query;
    const sourceLang = lang;

    try {
      // Call translation, fetch "de/het" word, fetch images, and fetch Wikipedia article in parallel
      await Promise.all([
        ...targetLanguages.map((targetLang) =>
          translateText(query, lang, targetLang)
        ),
        fetchDeHetWord(query),
        fetchImages(query),
        fetchArticle(query, lang),
      ]);
    } catch (error) {
      console.error("Error:", error);
    // Show error message to the user
    errorContainer.textContent = "Error: " + error;
    errorContainer.style.display = "block";
    // Hide loading indicator in case of an error
    loadingIndicator.style.display = "none";
    }
  }
};

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
    throw error;
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
    throw error; // Re-throw the error to handle it in the parent function (main)
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
    throw error; // Re-throw the error to handle it in the parent function (main)
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
    console.error("Error:", error);
    throw error; // Re-throw the error to handle it in the parent function (main)
  }
}
