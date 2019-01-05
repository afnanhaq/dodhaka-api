const express = require('express');
var randomstring = require("randomstring");
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'liverpool',
    database : 'dodhaka'
  }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

// the basic back-end domain
app.get('/', (req, res) => {
	res.send("back-end is working");
});
// getting 9 latest events from main page
app.get('/home', (req, res) => {
	knex.select('*').from('events')
	.then(events => {
		res.json(events.slice(-9))
	})
	.catch(err => res.status(400).json("error getting events"));
});
// getting all the events on the events page
app.get('/events', (req, res) => {
	knex.select('*').from('events')
	.then(events => {
		res.json(events)
	})
	.catch(err => res.status(400).json("error getting events"));
});
// getting specific information about one event
app.get('/events/:id', (req, res) => {
	const { id } = req.params;
	knex.select('*').from('events').where({ id : id })
	.then(event => {
		if (event.length) {
			res.json(event[0])
		} else {
			res.status(400).json("event does not exist")
		}
	})
	.catch(err => res.status(400).json("error accessing event"));
})
// posting data into the database
app.post('/postevent', (req, res) => {
	const { name, email, eventName, startDate, endDate, startTime, endTime, description, address, uploadedImageLink } = req.body;
	knex('events')
	.returning('reference_id')
	.insert({
		name,
		email,
		eventname: eventName,
		startdate: startDate,
		enddate: endDate,
		starttime: startTime,
		endtime: endTime,
		description,
		address,
		uploadedimagelink: uploadedImageLink,
		reference_id: randomstring.generate(9),
		posteddate: new Date()
	})
	.then(response => {
		res.json(response[0])
	})
	.catch(err => res.status(400).json("unable to post event"));
});
// checking if they can update app
app.post('/updatesignin', (req, res) => {
	const { reference_id, email } = req.body;
	knex.select('*').from('events')
		.where({
			email: email,
			reference_id: reference_id
		})
		.then(event => {
			res.json(event[0])
		})
		.catch(err => res.status(400).json("incorrect ID or email"))
})

app.put('/updateevent', (req, res) => {
	const { id, eventName, startDate, endDate, startTime, endTime, address, description } = req.body;
	knex('events')
		.where({ id: id })
		.update({
			eventname: eventName,
    		startdate: startDate,
    		enddate: endDate,
    		starttime: startTime,
    		endtime: endTime,
    		address: address,
    		description: description
		})
		.returning('id')
		.then(id => res.json(id[0]))
		.catch(err =>  res.status(400).json("unable to update event"))
})

app.delete('/deleteevent/:id', (req, res) => {
	const { id } = req.params;
	knex('events')
	  .where({ id: id })
	  .del()
	  .then(number => res.json(number))
	  .catch(err => res.status(400).json("unable to delete event"))
})

app.listen(3003);
