const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  const genAI = new GoogleGenerativeAI("AIzaSyAHoJ-46lpiQkJD8zGIPDKsqWDAfca6rY8");
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest"
  ];

  for (const m of modelsToTry) {
    console.log("Trying model:", m);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent("Test.");
      console.log(m, "SUCCESS", res.response.text());
    } catch (e) {
      console.log(m, "FAILED:", e.message);
    }
  }
}
test();
