'use strict'

const config = require('config')
const route = require('./route')
const moment = require('moment')
const pWrite = require('fs-writefile-promise')

const write = (journey) => (result) => {
	const filename = config.outputPath+journey.origin+'-'+journey.destination+'_'+moment(result.date).format('DD.MM.YYYY-HH:mm')+'.json'
	return pWrite(filename, JSON.stringify(result))
}

const main = () => {
	const jobs = []
	for(let r of config.routes){
		// process route
		jobs.push(route(r).then(write(r)).then((path) => console.log('Written to: '+path)))

		// (opt) process return trip
		if(config.returnTrips){
			r = {origin: r.destination, destination: r.origin}
			jobs.push(route(r).then(write(r)).then((path) => console.log('Written to: '+path)))
		}
	}
	return Promise.all(jobs)
}

main().then((done) => console.log('Done')).catch((err) => {throw new Error(err)})

module.exports = main
