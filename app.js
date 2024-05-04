const express =require('express');
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express();
app.use(express.json())

const path = require('path')
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
const intialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => console.log('Sucess'))
  } catch (e) {
    consol.log(`Db error ${e.message}`)
    process.exit(1)
  }
}
intialize()

//Get cricket Team API

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayerQuery = `
   SELECT *
   FROM cricket_team;`
  const teamDetails = await db.all(getPlayerQuery)
  response.send(
    teamDetails.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

//Get a player API

app.get('players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const teamPlayerQuery = `
    SELECT *
    FROM cricket_team 
    WHERE 
       player_id=${playerId};
   `
  const getDetails = await db.get(teamPlayerQuery)
  response.send(convertDbObjectToResponseObject(getDetails))
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.boody
  const postTeamQuery = `
       INSERT INTO 
       cricket_team( player_name , jersey_number, role)
       VALUES(
          '${playerName}',
           ${jerseyNumber},
          '${role}'
       );      
   `
  const sendDetails = await db.run(postTeamQuery)
  response.send('Player Added to Team')
})

app.put('players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.boody
  const updateQuery = `
      UPDATE 
        cricket_team 
      SET 
         player_name:'${playerName}',
         jersey_number:${jerseyNumber},
         role:'${role}'
      WHERE 
          player_id=${playerId};
            
    `

  await db.run(updateQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `
          DELETE 
          FROM cricket_team
          WHERE 
             player_id=${playerId};
   `
  await db.run(deleteQuery)
  response.send('Player Removed')
})

module.exports = app
