import type { APIRoute } from "astro";
import { Ollama } from "ollama";

export const POST: APIRoute = async ({ request }) => {
  const req = await request.json();
  const ingredients = req.ingredients;
  if (!ingredients) {
    return new Response(
      JSON.stringify({ error: "Missing ingredients" }),
      { status: 400 }
    )
  }

  const ollama = new Ollama({ host: "http://localhost:8000"})

  const response = await ollama.generate({
    model: 'llama3',
    prompt: `You've just been provided a list of ingredients. 
    Provide me with a list of five possible SANDWICH recipes that can be made with these ingredients: ${ingredients}. 
    You do not need to use every ingredient provided in the recipes.
    Do not preface the list of recipes with any other information or text. I just need the list of recipes.
    The format of your response should be as follows using markdown: For each recipe, provide the recipe name as an H2 title. Underneath the recipe name, have the word "Ingredients" in bold text, followed by the list of ingredients. Finally have the word "Instructions" in bold text, with a numbered list of instruction steps.`,
    stream: true
  })

  return new Response(
    new ReadableStream({
      start: async (controller) => {
        for await (const part of response) {
          controller.enqueue(part.response);
        }
        controller.close();
      }
    })
  )
}