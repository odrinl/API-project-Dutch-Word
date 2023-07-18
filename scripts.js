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
  history.pushState(currentState, "", `?q=${encodeURIComponent(sourceText)}`);



  // Define an array of target languages
  const targetLanguages = ["en", "ru", "ur", "ar", "tr"];

  // Loop through the target languages and call the translateText function
  targetLanguages.forEach(function (targetLang) {
    translateText(sourceText, sourceLang, targetLang);
  });
  // call the function to show het or de word
  fetchDeHetWord(sourceText);
  // Call the function to fetch and display related images
  fetchImages(sourceText);
  // Call the function to fetch and display Wikipedia article
  fetchArticle(sourceText, "nl");
}

// Handle the popstate event when the back or forward button is clicked
window.onpopstate = function (event) {
  if (event.state) {
    const { query, lang } = event.state;
    document.getElementById("search-input").value = query;
    const sourceLang = lang;    
    
      // Define an array of target languages
      const targetLanguages = ["en", "ru", "ur", "ar", "tr"];
    
      // Loop through the target languages and call the translateText function
      targetLanguages.forEach(function (targetLang) {
        translateText(query, lang, targetLang);
      });
      // call the function to show het or de word
      fetchDeHetWord(query);
      // Call the function to fetch and display related images
      fetchImages(query);
      // Call the function to fetch and display Wikipedia article
      fetchArticle(query, lang);
    }
  }

function translateText(sourceText, sourceLang, targetLang) {
  let url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    sourceLang +
    "&tl=" +
    targetLang +
    "&dt=t&q=" +
    encodeURI(sourceText);

  fetch(url)
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

function fetchDeHetWord(sourceText) {

  let targetURL = `https://www.ensie.nl/de-of-het/${encodeURIComponent(sourceText)}?&q=${encodeURIComponent(sourceText)}`;

  // Prepend the general CORS proxy URL
  // const corsProxyURL = "http://cors-anywhere.herokuapp.com/" + targetURL; 

  // Perform the fetch with the necessary headers
  fetch(targetURL, 
    // {
  //   headers: {
  //     "Origin": "https://www.ensie.nl/de-of-het/" // Replace with your actual origin URL
  //   }
  // }
  )
    .then((response) => response.text())
    .then(html => {
      // Create a temporary element to parse the HTML
      const tempElement = document.createElement("div");
      tempElement.innerHTML = html;
  
      // Find the desired element within the parsed HTML
      const resultElement = tempElement.querySelector("h4.mb-4");
  
      // Extract the context from the result element
      const dehetContext = resultElement.textContent;
  
      // Display the context on the page
      const dehetContainer = document.getElementById("dehet-container");
      dehetContainer.textContent = dehetContext;
  
      // Clean up the temporary element
      tempElement.remove();
    })
    .catch(error => {
      // Handle any errors that occur during the fetch
      console.error("Error:", error);
    });
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
          // Get the text content of the <li> element
          const liText = liElement.textContent;
          
          // Create a <a> element for the clickable link
          const linkElement = document.createElement("a");
          linkElement.id = "wiki-link";
          // Apply formatting to the link element
          linkElement.style.textDecoration = "underline";
          linkElement.style.cursor = "pointer";
          linkElement.style.color = "blue";

          // Split the text into words
          const words = liText.trim().split(" ");

          
          if (words.length <= 2) {
            liElement.innerHTML = linkElement.outerHTML;
          }

          // Get the first two words
          const linkWords = words.slice(0, 2);

         
          linkElement.textContent = linkWords.join(" ");

          // Replace the first two words with the link element
          const modifiedText = liText.replace(
            linkWords.join(" "),
            linkElement.outerHTML
          );

          // Check if there's a comma after the second word
          const commaIndex = modifiedText.indexOf(
            ",",
            linkWords.join(" ").length
          );
          // Check if there's a hyphen after the second word
          const hyphenIndex = modifiedText.indexOf(
            " -",
            linkWords.join(" ").length
          );
          if (commaIndex !== -1) {
            // Remove the comma from the link element
            const linkElementText = modifiedText.substring(
              modifiedText.indexOf(">") + 1,
              commaIndex
            );
            linkElement.textContent = linkElementText.trim();
          }
          if (hyphenIndex !== -1) {
            // Remove the hyphen from the link element
            const linkElementText = modifiedText.substring(
              modifiedText.indexOf(">") + 1,
              hyphenIndex - 4
            );
            linkElement.textContent = linkElementText.trim();
            }

          // Update the content of the <li> element
          liElement.innerHTML = modifiedText;

          // Add click event listener to the link element
          liElement.addEventListener("click", () => {
            const searchInput = document.getElementById("search-input");
            searchInput.value = linkElement.textContent;
            // Click the translate button automatically
            const translateButton = document.getElementById("translate-button");
            translateButton.click();
          });
        });
      }
    })
    .catch((error) => console.error("Error:", error));
}