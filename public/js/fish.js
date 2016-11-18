(function() {

	// clear console for debugging puperposes
	// console.clear();

	// shadow
	var shadow = document.createElement('div');
	// document.body.appendChild(shadow);
	document.getElementById('space_fish').appendChild(shadow);

	// create canvas for drawing
	var canvas = document.createElement('canvas');
	canvas.width = window.innerWidth;
	canvas.height = 200;
	document.getElementById('space_fish').appendChild(canvas);

	// correct canvas size on window resize
	// window.addEventListener('resize', function(){
	//     canvas.width = window.innerWidth;
	//     canvas.height = window.innerHeight;
	// });

	// get context for drawing
	var context = canvas.getContext('2d');

	// collection of active particles
	var ACTORS_MAX = 350; //số lượng cá max
	var actors = []; // mảng chứa cá
	var sceneLife = 20;
	var sceneColorHue = 0;

	// Basic Vector Class
	function Vector(x, y) {
		this._x = x;
		this._y = y;
	}

	Vector.prototype = {
		get x() {
			return this._x;
		},
		get y() {
			return this._y;
		},
		get magnitudeSquared() {
			return this._x * this._x + this._y * this._y;
		},
		get magnitude() {
			return Math.sqrt(this._x * this._x + this._y * this._y);
		},
		set x(value) {
			this._x = value;
		},
		set y(value) {
			this._y = value;
		},
		add: function(v) {
			this._x += v.x;
			this._y += v.y;
		},
		subtract: function(v) {
			this._x -= v.x;
			this._y -= v.y;
		},
		multiply: function(value) {
			this._x *= value;
			this._y *= value;
		},
		divide: function(value) {
			this._x /= value;
			this._y /= value;
		},
		normalize: function() {
			var magnitude = this.magnitude;
			if (magnitude > 0) {
				this.divide(magnitude);
			}
		},
		limit: function(treshold) {
			if (this.magnitude > treshold) {
				this.normalize();
				this.multiply(treshold);
			}
		},
		randomize: function(amount) {
			this._x = -amount * .5 + (Math.random() * amount);
			this._y = -amount * .5 + (Math.random() * amount);
		}
	}

	// Particle Class
	function Particle(type, p, v, r, mover, painter) {
		this._position = p;
		this._velocity = v;
		this._radius = r;
		this._mover = mover;
		this._painter = painter;
		this._type = type;

		this._pathLength = 5;
		this._path = [];
		this._life = Math.round(Math.random() * 20); //làm tròn : >5 tròn lên
		this._teleported = 0;
		this._died = false;

		this.reset();
	}

	Particle.prototype = {
		get dead() {
			return this._died;
		},
		get type() {
			return this._type;
		},
		get life() {
			return this._life + this._teleported;
		},
		get path() {
			return this._path;
		},
		get radius() {
			return this._radius;
		},
		get position() {
			return this._position;
		},
		get velocity() {
			return this._velocity;
		},
		act: function() {

			this._life += .01;
			this._teleported = Math.max(0, this._teleported - .01); // lấy số lớn hơn
			this._pathLength = Math.max(5, this._pathLength - .1);

			// update position
			this._mover(this);

			// get last recorded coordinate
			var last = this._path[this._path.length - 1];
			var dx = this._position.x - last.x;
			var dy = this._position.y - last.y;

			// only add if moved enough
			if (dx * dx + dy * dy < 5) {
				return;
			}

			// new coordinate
			this._path.push(new Vector(this._position.x, this._position.y));

			// remove clean up
			if (this._path.length > this._pathLength) {
				this._path.shift();
			}

		},
		paint: function() {
			this._painter(this);
		},
		reset: function() {
			this._path = [];
			this._path[0] = new Vector(this._position.x, this._position.y);
		},
		teleport: function() {
			this._teleported = 10 + Math.round(Math.random() * 10);
			this._life += this._teleported;
			this._pathLength += 3 + (Math.random() * 2);
			this._velocity.randomize(Math.random() * 2);
		},
		kill: function() {
			this._died = true;
		}
	}

	function fishPainter(actor) {

		var i = 0;
		var l = actor.path.length - 1;
		var p = .5 / l;
		var speed = actor.velocity.magnitude;
		var c = 10 + (actor.life % 360);
		var o;
		var f;
		var t;

		for (; i < l; i++) {
			f = actor.path[i];
			t = actor.path[i + 1];
			o = (i * p) * speed;
			context.beginPath();
			context.moveTo(f.x, f.y);
			context.lineTo(t.x, t.y);
			context.strokeStyle = 'hsla(' + c + ',100%,75%,' + o + ')';
			context.stroke();
			context.closePath();
		}
	}

	function fishMover(actor) {

		// attract other particles
		var totalForce = new Vector(0, 0);
		var force = new Vector(0, 0);
		var i = 0;
		var l = actors.length;
		var distance;
		var pull;
		var a;

		for (; i < l; i++) {

			a = actors[i];

			if (a === actor) {
				continue;
			}

			force.x = a.position.x - actor.position.x;
			force.y = a.position.y - actor.position.y;
			distance = force.magnitude;

			force.normalize();

			pull = a.type === 'food' ? 1 / distance : .04 / distance;

			force.multiply(pull);

			if (a.type === 'food' && distance < 25) {

				totalForce = force;
				a.velocity.x = -actor.velocity.x * .5;
				a.velocity.y += actor.velocity.y * .01;

				if (distance <= 2) {
					a.kill();
				}

				break;
			}

			totalForce.add(force);
		}

		actor.velocity.add(totalForce);
		actor.position.add(actor.velocity);

		// loop actor around
		if (actor.position.x > canvas.width) {
			actor.position.x = 0;
			actor.reset();
			actor.teleport();
		}

		if (actor.position.y > canvas.height) {
			actor.position.y = 0;
			actor.reset();
			actor.teleport();
		}

		if (actor.position.x < 0) {
			actor.position.x = canvas.width;
			actor.reset();
			actor.teleport();
		}

		if (actor.position.y < 0) {
			actor.position.y = canvas.height;
			actor.reset();
			actor.teleport();
		}
	}

	function foodMover(actor) {

		actor.velocity.y = Math.min(actor.velocity.y += .05 * Math.random(), 2);
		actor.position.y += actor.velocity.y;
		actor.position.x += actor.velocity.x;

		// remove if moves of screen
		if (actor.position.y > canvas.height || actor.position.x > canvas.width) {
			actor.kill();
		}

	}

	function foodPainter(actor) {
		context.beginPath();
		context.arc(actor.position.x, actor.position.y, actor.radius, 0, 2 * Math.PI, false);
		context.fillStyle = 'hsl(' + sceneColorHue + ',100%,75%)';
		context.fill();
	}

	// generic loops for updating actor state and painting
	function paint(actors, context) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		var i = 0;
		var l = actors.length;
		for (; i < l; i++) {
			actors[i].paint();
		}
	}

	function direct(actors) {

		// update states
		var i = 0;
		var l = actors.length;
		for (; i < l; i++) {
			actors[i].act();
		}

		// clean killed actors
		l--;
		while (l >= 0) {
			if (actors[l].dead) {
				actors.splice(l, 1);
			}
			l--;
		}
	}

	// scene variables (used for coloring background)
	function tick() {

		// aniamte background color slowly
		sceneLife += .1;
		sceneColorHue = Math.round(sceneLife) % 360;
		document.documentElement.style.backgroundColor = 'hsl(' + sceneColorHue + ',100%,5%)';
		shadow.style.boxShadow = 'inset 0 0 20px 20px hsl(' + sceneColorHue + ',100%,5%)';

		// move actors and paint to context
		direct(actors);
		paint(actors, context);

		// new tick!
		window.requestAnimationFrame(tick);
	}

	// creates a food pebble
	function createFood(x, y) {
		return new Particle(
			'food',
			new Vector(x, y),
			new Vector(-.5 + Math.random(), .1 + Math.random()),
			.5 + Math.random(),
			foodMover,
			foodPainter
		);
	}

	// creates a random fish on the screen
	function createFish() {
		return new Particle(
			'fish',
			new Vector(
				Math.random() * window.innerWidth,
				Math.random() * window.innerHeight
			),
			new Vector(2 * (-.5 + Math.random()), 2 * (-.5 + Math.random())),
			1,
			fishMover,
			fishPainter
		);
	}

	// init
	(function() {

		// create fishies
		var fish = ACTORS_MAX - 50;
		while (fish--) {
			actors.push(createFish());
		}

		// start animation loop
		tick();

		// listen to events so we can spawn foor for the fish
		document.body.addEventListener('click', function(e) {
			var i = 0;
			var count = Math.round(3 + (Math.random() * 7));
			for (; i < count; i++) {
				actors.push(
					createFood(
						e.pageX + (-25 + Math.random() * 50),
						Math.random() * 5
					)
				);
			}
		});

		// setTimeout(function() {
		// 	document.querySelector('h1').classList.add('hide');
		// }, 2000);

	}());

}());