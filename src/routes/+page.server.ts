/** @type {import('./$types').Actions} */
export const actions = {	
  default: async (event) => {		// TODO log the user in	}};


  let result1 = await event.platform.env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS ErrorSuggestion (
      videoId INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP PRIMARY KEY
    );`
    )//.bind(111)
    .run();
    console.log(result1);
  
  let result2 = await event.platform.env.DB.prepare(
    "INSERT INTO ErrorSuggestion (videoId) VALUES (?1);"
    ).bind(111)
    .run();
    console.log(result2)


  let result = await event.platform.env.DB.prepare(
    "select * from ErrorSuggestion"//"INSERT INTO ErrorSuggestion (videoId) VALUES (?1);"
    )//.bind(111)
    .run();
    console.log(result)

  return result;
}}