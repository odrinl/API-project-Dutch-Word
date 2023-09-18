import { dehetContainer } from './constants.js';

// Function to fetch "de/het" word
export async function fetchDeHetWord(query, lang) {
  const URL = `https://${lang}.wiktionary.org/w/api.php?action=parse&format=json&page=${query}&prop=text&formatversion=2&origin=*`;

  dehetContainer.innerHTML = '';

  try {
    const fetchResponse = await fetch(URL);
    const responseData = await fetchResponse.json();

    // Extract the gender information from the parsed HTML content
    if (!responseData.parse) {
      // Check if the query had an initial uppercase letter
      if (query.charAt(0) === query.charAt(0).toUpperCase()) {
        // Retry with the same query converted to lowercase
        await fetchDeHetWord(query.toLowerCase(), lang);
      } else {
      console.log(responseData.error.info);
      }
    } else {
      const htmlContent = responseData.parse.text;
      const genderWord = findGenderInHtml(htmlContent);

      // Highlight the first word in the "de/het" word
      if (genderWord) {
        dehetContainer.innerHTML = `<span class="first-word">${genderWord}</span> ${query}`;
      } else {
        console.error('Gender not found on the page.');
        dehetContainer.innerHTML = `<p style="color: grey" align="center"><i>Gender not found.</i></p>`;
      }
    }
  } catch (error) {
    console.log(error);
    dehetContainer.innerHTML = `<p style="color: grey" align="center"><i>${error.message}</i></p>`;
  }
}

function findGenderInHtml(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const header = doc.getElementById('Zelfstandig_naamwoord');
  if (header) {
    // Get the letter inside the <span> element after the header
    const span =
      header.parentElement.nextElementSibling.querySelector('p span');
    if (span) {
      const gender = span.textContent.trim();

      if (gender === 'o') {
        const genderWord = 'het';
        return genderWord;
      } else {
        const genderWord = 'de';
        return genderWord;
      }
    } else {
      console.log('Gender not found.');
    }
  }
}
