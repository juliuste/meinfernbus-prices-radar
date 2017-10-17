'use strict'

const moment = require('moment-timezone')
const journeys = require('meinfernbus').journeys
const config = require('config')
const queue = require('p-queue')

const dates = (days) => {
	const startDate = moment().tz('Europe/Berlin').startOf('day')
	const dateList = []
	for(let i = 0; i<days; i++){
		dateList.push(moment(startDate).add(i, 'days'))
	}
	return dateList
}

const addRoute = (route) => (result) => {
	return {
		route: route,
		data: result,
		requestDate: moment()
	}
}

const formatResults = (resultList) => {
	let mergedList = []
	for(let list of resultList){
		mergedList = mergedList.concat(list)
	}
	return mergedList
}

const main = (route) => {
	const q = new queue({concurrency: 1})
	const dateList = dates(config.days)
	const resultList = []
	for(let date of dateList){
		resultList.push(q.add(() => journeys(route.origin, route.destination, moment(date).toDate(), config.apiOptions)))
	}
	return Promise.all(resultList).then(formatResults).then(addRoute(route))
}

module.exports = main
