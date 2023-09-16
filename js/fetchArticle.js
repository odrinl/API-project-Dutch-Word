// Function to fetch Wikipedia article
import { searchInput, translateButton, articleContainer } from './constants.js';
export async function fetchArticle(query, lang) {
  const URL = `https://${lang}.wikipedia.org/w/api.php?action=parse&prop=text&origin=*&page=${query}&format=json`;
  try {
    const fetchResponse = await fetch(URL);
    const responseData = await fetchResponse.json();

    // Extract the pronunciation information from the parsed HTML content
    if (!responseData.parse) {
      console.log(responseData.error.info);
      articleContainer.innerHTML = `<p style="color: grey"><i>${responseData.error.info}.</i></p>`;
    } else {
      const htmlContent = responseData.parse.text;
      const wikipage = getWikipage(htmlContent, query);

      // insert the wikipage in the page
      if (wikipage) {
        articleContainer.innerHTML = wikipage;
        const linkElements = articleContainer.querySelectorAll('a');
        // Add click event listeners to all link elements of table
        linkElements.forEach((linkElement) => {
          linkElement.addEventListener('click', (event) => {
            event.preventDefault();
            searchInput.value = linkElement.textContent;
            translateButton.click();
          });
        });
      } else {
        console.error('Wikipage not found');
      }
    }
  } catch (error) {
    console.log(error);
    articleContainer.innerHTML = `<p style="color: grey" align="center"><i>${error.message}</i></p>`;
  }
}

// Function to extract pronunciation from HTML content
function getWikipage(htmlContent, query) {
  // Create a DOMParser
  const parser = new DOMParser();
  // Parse the HTML content
  const doc = parser.parseFromString(htmlContent['*'], 'text/html');
  const extractedHTML = doc.querySelector('.mw-parser-output');
  // Find the <p><b>Vogel</b></p> element
  const startElement = extractedHTML.querySelector('p b');
  let wikipageHTML;
  let endElement;
  if (startElement) {
    const endElement2 = extractedHTML.querySelector('.toc');

    if (endElement2) {
      endElement = endElement2;
    }
    if (!endElement) {
      endElement = extractedHTML.querySelector('.mw-headline');
    }
    if (!endElement) {
      endElement = extractedHTML.querySelector('p br');
    }
    if (!endElement && endElement) {
      endElement = endElement2;
    }
    if (startElement && endElement) {
      // Create a range to select the desired content
      const range = document.createRange();
      range.setStartBefore(startElement.parentElement);
      range.setEndBefore(endElement);

      // Create a document fragment and append the selected content to it
      const fragment = range.cloneContents();

      // Convert the fragment to an HTML string
      wikipageHTML = new XMLSerializer().serializeToString(fragment);
    }
  } else {
    wikipageHTML = extractedHTML.innerHTML;
  }

  if (wikipageHTML) {
    return wikipageHTML;
  } else {
    console.log('Wikipage not found');
    return null;
  }
}
