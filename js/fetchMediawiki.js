// Function to fetch Mediawiki article
import {mediawikiContainer} from './constants.js';

export async function fetchMediawiki(query, lang) {
  const URL = `https://${lang}.wiktionary.org/w/api.php?action=parse&format=json&page=${query}&prop=text&formatversion=2&origin=*`;
  mediawikiContainer.innerHTML = "";

  try {
    const fetchResponse = await fetch(URL);
    const responseData = await fetchResponse.json();

    // Extract the pronunciation information from the parsed HTML content (modify this based on the HTML structure).
    if (!responseData.parse) {
      console.log(responseData.error.info);
      mediawikiContainer.innerHTML = `<p style="color: grey"><i>Error - ${responseData.error.info}</i></p>`;
    } else {
      const htmlContent = responseData.parse.text;
      const pronunciation = extractPronunciationFromHtml(htmlContent);

      // Embed the audio in the page.
      if (pronunciation) {
        const audioElement = document.createElement('audio');
        audioElement.controls = true;
        audioElement.src = pronunciation;
        mediawikiContainer.appendChild(audioElement);
      } else {
        console.error('Pronunciation not found on the page.');
      }
    }
  } catch (error) {
    console.log(error);
    mediawikiContainer.innerHTML = `<p style="color: grey" align="center"><i>Error - ${error.message}</i></p>`;
  }
}

// Function to extract pronunciation from HTML content (you need to implement this).
function extractPronunciationFromHtml(htmlContent) {
  // Create a DOMParser
  const parser = new DOMParser();
  // Parse the HTML content
  const doc = parser.parseFromString(htmlContent, 'text/html');
  // Find the element with class 'IPA unicode audiolink'
  const audioLinkElement = doc.querySelector('.IPA.unicode.audiolink a');
  // Check if the element exists
  if (audioLinkElement) {
    // Get the href attribute (the link)
    const audioLink = audioLinkElement.getAttribute('href');
    return(`https:${audioLink}`);
  } else {
    console.log('Element not found');
    return null;
  }
}


