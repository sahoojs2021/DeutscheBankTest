/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

// if you want to use es6, you can do something like
//     require('./es6/myEs6code')
// here to load the myEs6code.js file, and it will be automatically transpiled.

// Change this to get detailed logging from the stomp library
global.DEBUG = false


const updatedFxPrice = []
const fxSparkLineData=[]
const startPrices = {
	gbpusd: 1.4587,
	gbpeur: 1.288,
	gbpaud: 1.9107,
	usdeur: 0.883,
	gbpjpy: 158.29,
	usdjpy: 108.505,
	eurjpy: 122.91,
	gbpchf: 1.4126,
	euraud: 1.4834,
	eurchf: 1.0969,
	eurcad: 1.4214,
	gbpcad: 1.8303
}

const currencies = Object.keys(startPrices)
const publicData = {}
const internal = {}
for (let ccy in startPrices) {
	const spread = Math.random() * 0.05
	const mid = startPrices[ccy]
	internal[ccy] = mid
	publicData[ccy] = {
		name: ccy,
		bestBid: mid - mid * (spread / 2),
		bestAsk: mid + mid * (spread / 2),
		openBid: mid - mid * (spread / 2),
		openAsk: mid + mid * (spread / 2),
		lastChangeAsk: 0,
		lastChangeBid: 0
	}
}

const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)
client.debug = function(msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}

function connectCallback() {
  document.getElementById('stomp-status').innerHTML = "It has now successfully connected to a stomp server serving price updates for some foreign exchange currency pairs."

	setInterval(function tick() {
		for (let i = 0; i < Math.random() * 5; i++) {
			const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)]
			const mid = internal[randomCurrency]
			const spread = Math.random() * 0.05
			const diff = (Math.random() * 0.08 - 0.04) * mid
			const newMid = (mid + diff)
			const bid = newMid - newMid * (spread / 2)
			const ask = newMid + newMid * (spread / 2)
			const data = publicData[randomCurrency]
			data.lastChangeBid = bid - data.bestBid
			data.lastChangeAsk = ask - data.bestAsk
			data.bestBid = bid
			data.bestAsk = ask

			client.send("/fx/prices", { priority: 9 }, JSON.stringify(data))
			updatedFxPrice[randomCurrency] = data;
		}
		drawSortedTable(updatedFxPrice);
		drawSparkLine(updatedFxPrice);
	}, 1000);
}

client.connect({}, connectCallback, function(error) {
  alert(error.headers.message)
})

const exampleSparkline = document.getElementById('example-sparkline')
Sparkline.draw(exampleSparkline, [1, 2, 3, 6, 8, 20, 2, 2, 4, 2, 3])



function drawSortedTable(updatedFxPrice) {
	let refUpdatedFxPrice = updatedFxPrice;
	refUpdatedFxPrice.sort(function(a, b) {
		return a.bestBid - b.bestBid;
	});

	let tbdy = '';
	let rowCount = 1;
	for (let x in refUpdatedFxPrice) {
		tbdy += "<tr>";
		tbdy += "<td>" + rowCount + "</td>";
		tbdy += "<td style='text-align:left;'>" + (refUpdatedFxPrice[x]['name']).toUpperCase() + "</td>";
		tbdy += "<td>" + (refUpdatedFxPrice[x]['bestBid']).toFixed(5) + "</td>";
		tbdy += "<td>" + (refUpdatedFxPrice[x]['bestAsk']).toFixed(5) + "</td>";
		tbdy += "<td>" + (refUpdatedFxPrice[x]['openBid']).toFixed(5) + "</td>";
		tbdy += "<td>" + (refUpdatedFxPrice[x]['openAsk']).toFixed(5) + "</td>";
		tbdy += "<td>" + (refUpdatedFxPrice[x]['lastChangeAsk']).toFixed(5) + "</td>";
		tbdy += "<td>" + (refUpdatedFxPrice[x]['lastChangeBid']).toFixed(5) + "</td>";
		tbdy += "</tr>";
		rowCount++;
	}
	document.getElementById("updated_fx_price").innerHTML = tbdy;
}

function drawSparkLine(slData) {
	let fxSparkLineData = [];
	for (let x in slData) {
		fxSparkLineData.push((slData[x]['bestBid'] + slData[x]['bestAsk']) / 2);
	}

	const fxPriceSparkline = document.getElementById('fx_price_sparkline')
	Sparkline.draw(fxPriceSparkline, fxSparkLineData)
}