// Function to fetch Wikipedia article
import { searchInput, translateButton } from './constants.js';
export async function fetchArticle(query, lang) {
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