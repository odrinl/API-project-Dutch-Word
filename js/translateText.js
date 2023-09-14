import { translationContainer } from './constants.js';

// Function to translate text
export async function translateText(sourceText, sourceLang, targetLang) {
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
    console.error(error);
    translationContainer.innerHTML = `<p style="color: grey" align="center"><i>Error - ${error.message}</i></p>`
  }
}