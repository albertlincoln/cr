let sensors = new Array(10).fill('sensor').map((sensor, index) => {
	return {
		name: sensor + index,
		distanceFromLastWayPoint: 1000,
		carsWhichDrovePast: []
	}
});

sensors[0].distanceFromLastWayPoint = 0;

LOG_LEVEL = 'DEBUG';

function debug(msg) {
	if(LOG_LEVEL == 'DEBUG') {
		console.log(msg);
	}
}


let cars = new Array(10).fill('car').map((car, index) => {
	return {
		name: car + index,
		distanceFromLastWayPoint: 0,
		lastWayPoint: 0,
		currentSpeed: 1 + index,
		start: function() {
			return new Promise((resolve, reject) => {
				debug(`${this.name} start!`)
				sensors[this.lastWayPoint].carsWhichDrovePast.push(this.name)
				this.lastWayPoint = this.lastWayPoint + 1
				resolve(this);
			})
		},
		drive: function() {
			return new Promise((resolve, reject) => {
				if (this.lastWayPoint == sensors.length) {
					resolve(this);
				}
				let eta = sensors[this.lastWayPoint].distanceFromLastWayPoint / this.currentSpeed;
				let delay = new Promise(resolve => setTimeout(resolve, eta))
				if (this.lastWayPoint < sensors.length) {
					delay.then(d => {
						debug(`${this.name} still driving and has passed sensor ${this.lastWayPoint}`);
						sensors[this.lastWayPoint].carsWhichDrovePast.push(this.name)
						this.lastWayPoint = this.lastWayPoint + 1
						resolve(this.drive())
					});
				}
			})
		}
	}
});

cars[2].currentSpeed = 99;
cars[8].currentSpeed = 98;

setTimeout(() => {
	cars[3].currentSpeed = 70;
}, 2400);

setTimeout(() => {
	cars[0].currentSpeed = 80;
}, 3740);

//console.log(cars);


// for the race to be finished, all cars have to get through all waypoints
// for a car to get through all waypoints, it must go through each waypoint in order


cars_racing = [];
for(let index = 0; index < cars.length; index++) {
	car = cars[index];
	cars_racing.push(car.start().then(car => { return car.drive() }));
}

let p = Promise.all(cars_racing)

p.then((ok) => { console.log('ok'); console.log(sensors)});
