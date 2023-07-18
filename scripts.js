document
  .getElementById("translate-button")
  .addEventListener("click", translate);
document
  .getElementById("search-input")
  .addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      translate();
    }
  });

function translate() {
  
  const sourceText = document.getElementById("search-input").value;
  const sourceLang = "nl";

  // Save the current search query to the browser history
  const currentState = {
    query: sourceText,
    lang: sourceLang
  };
  history.pushState(currentState, "", `?q=${sourceText}`);



  // Define an array of target languages
  const targetLanguages = ["en", "ru", "ur", "ar", "tr"];

  // Loop through the target languages and call the translateText function
  const translationPromises = targetLanguages.map((targetLang) =>
  translateText(sourceText, sourceLang, targetLang)
);

 // Wait for all the translation promises to resolve
Promise.all(translationPromises)
.then(() => {
  // All translations are completed
  // Call the function to fetch the "het" or "de" word
  fetchDeHetWord(sourceText);
  // Call the function to fetch and display related images
  fetchImages(sourceText);
  // Call the function to fetch and display Wikipedia article
  fetchArticle(sourceText, "nl");
})
.catch((error) => console.error("Error:", error));
}

// Handle the popstate event when the back or forward button is clicked
window.onpopstate = function (event) {
  if (event.state) {
    const { query, lang } = event.state;
    document.getElementById("search-input").value = query;
    const sourceLang = lang;

    // Define an array of target languages
    const targetLanguages = ["en", "ru", "ur", "ar", "tr"];

    // Loop through the target languages and create an array of translation promises
    const translationPromises = targetLanguages.map((targetLang) =>
      translateText(query, lang, targetLang)
    );

    // Wait for all the translation promises to resolve
    Promise.all(translationPromises)
      .then(() => {
        // All translations are completed
        // Call the function to fetch the "hwt" or "de" word
        fetchDeHetWord(query);
        // Call the function to fetch and display related images
        fetchImages(query);
        // Call the function to fetch and display Wikipedia article
        fetchArticle(query, lang);
      })
      .catch((error) => console.error("Error:", error));
  }
};


function translateText(sourceText, sourceLang, targetLang) {
  let url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    sourceLang +
    "&tl=" +
    targetLang +
    "&dt=t&q=" +
    sourceText;

  // Return the fetch promise
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // Get the corresponding element based on the target language
      let translatedWordElement = document.getElementById(
        `translated-word-${targetLang}`
      );
      translatedWordElement.textContent = data[0][0][0];
    })
    .catch((error) => console.error("Error:", error));
}

function fetchDeHetWord(word) {
  const fetchDeHetWord = document.getElementById("search-input").value;
  
  let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=nl&dt=t&q=the ${fetchDeHetWord}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const dehetContainer = document.getElementById("dehet-container");
      dehetContainer.textContent = data[0][0][0];
    })
    .catch((error) => console.error("Error:", error));
  
}


function fetchImages(query) {
  const API_KEY = "38259307-8733456e700ed630a3379faf0";
  const perPage = 5;
  const URL = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&lang=nl&image_type=photo&safesearch=true&per_page=${perPage}`;

  fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      if (data.hits.length > 0) {
        const imagesContainer = document.getElementById("images-container");
        imagesContainer.innerHTML = ""; // Clear existing content

        data.hits.forEach((hit) => {
          const imgElement = document.createElement("img");
          imgElement.src = hit.webformatURL;
          imgElement.alt = hit.tags;
          imgElement.classList.add("image");
          imagesContainer.appendChild(imgElement);
        });
      }
    })
    .catch((error) => console.error("Error:", error));
}

function fetchArticle(query, lang) {
  const URL = `https://${lang}.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts&format=json&exintro=&titles=${encodeURIComponent(
    query
  )}`;

  fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      const pages = data.query.pages;
      const pageIds = Object.keys(pages);
      if (pageIds.length > 0) {
        const pageId = pageIds[0];
        const extract = pages[pageId].extract;

        const articleContainer = document.getElementById("article-container");
        articleContainer.innerHTML = extract;
        // Find all <li> elements within the article container
        const liElements = document.querySelectorAll("#article-container li");

        // Iterate over each <li> element
        liElements.forEach((liElement) => {
          const liText = liElement.textContent;
          const words = liText.split(/(\b|\s+|[()]|[,]|[-])(?<!\w-)(?!\s+)/).filter(Boolean);

          let linkWords = [];
          const stopElements = ["),", ")", ",", "-"];
          let foundStopElement = false;

          if (words.some(word => stopElements.includes(word)) || words.length < 4) {

            const linkElement = document.createElement("a");
            linkElement.id = "wiki-link";
            linkElement.style.textDecoration = "underline";
            linkElement.style.cursor = "pointer";
            linkElement.style.color = "#48bed8";
              
          
            for (let i = 0; i < words.length; i++) {
              const word = words[i];
              if (stopElements.includes(word)) {
                foundStopElement = true;
                if (word === "-") {
                  linkWords.pop(); // Remove the space before hyphen
                }
                if (word === ")") {
                  linkWords.push(")"); 
                }
                if (word === "),") {
                  linkWords.push(")"); // Add ")" without the comma
                } 
                break;
              }
              linkWords.push(word);
            }
        
            const linkWordsText = linkWords.join('');
            linkElement.textContent = linkWordsText;
            const modifiedText = liText.replace(linkWordsText, linkElement.outerHTML);
            liElement.innerHTML = modifiedText;
          liElement.addEventListener("click", () => {
            const searchInput = document.getElementById("search-input");
            searchInput.value = linkWordsText;
            const translateButton = document.getElementById("translate-button");
            translateButton.click();
          });
        }
        });
      }
    })
    .catch((error) => console.error("Error:", error));
}