import { API_KEY} from './constants.js';
import { imagesContainer  } from './constants.js';

// Function to fetch images
export async function fetchImages(query) {
  const ImagesPerPage = 5;
  const URL = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&lang=nl&image_type=photo&safesearch=true&per_page=${ImagesPerPage}`;

  try {
    const fetchResponse = await fetch(URL);
    const responseData = await fetchResponse.json();

    if (responseData.hits.length > 0) {
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
    console.error(error);
    imagesContainer.innerHTML = `<p style="color: grey" align="center"><i>${error.message}</i></p>`
  }
}