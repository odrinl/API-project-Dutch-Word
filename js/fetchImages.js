import { API_KEY} from './constants.js';

// Function to fetch images
export async function fetchImages(query) {
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
    // Re-throw the error to handle it in the parent function (main)
    throw new Error(`fetchImages: ${error.message}.`); 
  }
}