const OpenAI = require("openai");

const openai = new OpenAI();

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "give me 3 pros and 3 cons of owning a dog. use 2 separate lists." }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
}

main();
