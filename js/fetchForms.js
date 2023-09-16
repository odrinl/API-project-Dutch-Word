// Function to fetch Mediawiki forms of the word
import { translateButton, searchInput, formsContainer } from './constants.js';

export async function fetchForms(query, lang) {
  const URL = `https://${lang}.wiktionary.org/w/api.php?action=parse&format=json&page=${query}&prop=text&formatversion=2&origin=*`;
  formsContainer.innerHTML = '';

  try {
    const fetchResponse = await fetch(URL);
    const responseData = await fetchResponse.json();

    // Extract the forms information from the parsed HTML content
    if (!responseData.parse) {
      console.log(responseData.error.info);
    } else {
      const htmlContent = responseData.parse.text;
      const formsHTMLCollection = extractFormsTableFromHtml(htmlContent);
      const formsFullArray = Array.from(formsHTMLCollection);
      const forms = Array.from(formsFullArray).slice(0, 2);
   
      if (forms) {
        forms.forEach((form) => {
          formsContainer.appendChild(form);
          const linkElements = form.querySelectorAll('a');
          // Add click event listeners to all link elements of table
          linkElements.forEach((linkElement) => {
            linkElement.addEventListener('click', (event) => {
              event.preventDefault();
              searchInput.value = linkElement.textContent;
              translateButton.click();
            });
          });
        });
      } else {
        console.error('Forms not found on the page.');
      }
    }
  } catch (error) {
    console.log(error);
    formsContainer.innerHTML = `<p style="color: grey" align="center"><i>${error.message}</i></p>`;
  }
}

// Function to extract forms from HTML content
function extractFormsTableFromHtml(htmlContent) {
  // Create a DOMParser
  const parser = new DOMParser();
  // Parse the HTML content
  const doc = parser.parseFromString(htmlContent, 'text/html');
  // Find the table with class infobox
  const table = doc.getElementsByClassName('infobox');
  // Check if the table exists
  if (table) {
    return table;
  } else {
    console.log('Table not found');
    return null;
  }
}
