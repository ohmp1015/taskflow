// Function to call the backend API route for translation
// Sends the text and desired target language to the server
// Returns the translated version as plain text
export async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `Translation failed with status ${res.status}`);
    }

    const translatedText = await res.text();
    
    if (!translatedText || translatedText.trim().length === 0) {
      throw new Error("No translation received from server");
    }

    return translatedText;
  } catch (error) {
    console.error("Translation request failed:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Translation service unavailable");
  }
}
