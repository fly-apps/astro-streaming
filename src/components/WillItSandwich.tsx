import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function WillItSandwich() {
  const [recipes, setRecipes] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecipes("");
    const formData = new FormData(event.currentTarget);
    const ingredients = formData.get("ingredients") as string;

    const resp = await fetch("http://localhost:4321/get-sandos", {
      method: "POST",
      body: JSON.stringify({ingredients}),
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

    await streamResponse(resp);
  }

  async function streamResponse(resp: Response) {
    const reader = await resp.body?.getReader();
    const decoder = new TextDecoder();

    reader?.read().then(async function processText({ done, value}) {
      if (done) return;
      const text = decoder.decode(value);
      setRecipes((prevRecipes) => prevRecipes + text);
      return reader?.read().then(processText);
    })
  }

  return(
    <>
      <form onSubmit={handleSubmit} className="mb-5">
        <textarea name="ingredients" placeholder="List your ingredient's here, separated by commas" 
          className="border border-gray-400 rounded-md p-5 text-black w-full min-h-32 mb-5 outline-none focus:ring-4 focus:ring-lime-400 focus:border-lime-600 text-xl"/>
        <button type="submit" className="bg-lime-600 hover:bg-lime-700 text-xl rounded-md py-5 text-white text-center w-full">Generate Sandwiches</button>
      </form>
      {recipes &&
      <div className="bg-lime-100 p-5 rounded-md">
        <Markdown remarkPlugins={[remarkGfm]}>{recipes}</Markdown>
      </div>
      }
    </>
  )
}