async function f(){
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyAHoJ-46lpiQkJD8zGIPDKsqWDAfca6rY8');
    const json = await res.json();
    const models = json.models.filter(m => m.supportedGenerationMethods.includes("generateContent")).map(m => m.name);
    console.log(models);
  } catch(e) {
    console.error(e);
  }
}
f();
