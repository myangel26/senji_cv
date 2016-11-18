(function(){
	var width = true;
	var height = true;
	var largeHeader = true;
	var canvas = true;
	var ctx = true;
	var points = true;
	var target = true;
	var animateHeader = true;

	var overlay = true;

	// Main
	initHeader();
	initAnimation();
	addListeners();

	function initHeader(){
		width = window.innerWidth;console.log(width);
		// height = window.innerHeight;console.log(height);
		height = 400;
		// console.log(width + " " + height);
		target = { x: width/2 , y: height/2 };

		largeHeader = document.getElementById('large-header');
        // largeHeader.style.height = height+'px';//xét id='background_space' co chiu cao là
		$('.overlay').css("height", height + 'px');//xet class overlay co chiu bang là
		//xét cứng min-height 400px;
		// background_space.style.height = 400 + 'px';//xét id='background_space' co chiu cao là
		// $('.overlay').css("height", 400 + 'px');//xet class overlay co chiu bang là

		canvas = document.getElementById('demo-canvas');
		canvas.width = width;
		canvas.height = height;
		// canvas.height = 400;
		// console.log(canvas);
		ctx = canvas.getContext('2d');
		// console.log(ctx);

		//tạo 1 mảng các điểm sao

		points = [];
		for(var x = 0; x < width; x = x + width/20) {
			for(var y = 0; y < height; y = y + height/20) {
				var px = x + Math.random()*width/20;
				var py = y + Math.random()*height/20;
				var p = { x: px, originX: px, y: py, originY: py };
				points.push(p);
			}
		}console.log(points);


		// với mỗi điểm tìm 5 điểm gần nhất
		for(var i = 0; i < points.length; i++) {
			var closest = [];//mang chứa 5 điểm gần nhất
			// console.log(closest);
			var p1 = points[i];
			for (var j = 0; j < points.length; j++) {
				var p2 = points[j];//console.log(p2);
				if (p1 != p2) { // nếu điểm 1 khác diem 2
					var placed = false;//console.log(closest);
					for (var k = 0; k < 5; k++) {//console.log(placed);
						if(placed == false){ // nếu place == false thj moi vao day
							if (closest[k] == undefined) { //kiem tra neu diem thu k chua co thj moi push
								closest[k] = p2;
								placed = true;
							};
						}
					};//nếu mảng đã có 5 diem r thj chay for duoi
					for (var k = 0; k < 5; k++) {
						if(placed == false) {
							if (getDistance(p1,p2) < getDistance(p1, closest[k]) ) {
								closest[k] = p2;
								placed = true;
							};
						}
					};
				};
			};
			p1.closest = closest;
		};
		// assign a circle to each point
		for(var i in points) {
			var c = new Circle(points[i], 2+Math.random()*2, 'rgba(255,255,255,0.3)');
			points[i].circle = c;
		}
	
	}//end initHeader()

	// animation
	function initAnimation() {
		animate();
		for(var i in points) {
			shiftPoint(points[i]);
		}
	}

	//hàm anime vẽ ra 
	function animate() {
		if(animateHeader) {
			ctx.clearRect(0,0,width,height);//xóa 1 vùng canvas (x,y,width,height)
			for(var i in points) {
				// detect points in range
				if(Math.abs(getDistance(target, points[i])) < 4000) {
					points[i].active = 0.6;
					points[i].circle.active = 0.9;
				} else if(Math.abs(getDistance(target, points[i])) < 20000) {
					points[i].active = 0.3;
					points[i].circle.active = 0.6;
				} else if(Math.abs(getDistance(target, points[i])) < 40000) {
					points[i].active = 0.05;
					points[i].circle.active = 0.3;
				} else {
					points[i].active = 0;
					points[i].circle.active = 0;
				}

				drawLines(points[i]);
				points[i].circle.draw();
			}
		}
		requestAnimationFrame(animate);
	}

	//Diểm random di chuyển
	function shiftPoint(p) {//(điểm,thời gian chuyển động,target,)
		TweenLite.to(p, 1+1*Math.random(), {x:p.originX-50+Math.random()*100,
			y: p.originY-50+Math.random()*100, ease:Circ.easeInOut,
			onComplete: function() {
				shiftPoint(p);
			}});
	}

	//Vẽ đường thẳng 2 điểm
	// Canvas manipulation
	function drawLines(p) {
		if(p.active == false) return;
		for(var i in p.closest) {
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(p.closest[i].x, p.closest[i].y);
			ctx.strokeStyle = 'rgba(156,217,249,'+ p.active+')';
			ctx.stroke();
		}
	}

	function addListeners() {
		if(!('ontouchstart' in window)) {
			window.addEventListener('mousemove', mouseMove);
		}
		// window.addEventListener('scroll', scrollCheck);
		// window.addEventListener('resize', resize);
	}

	function mouseMove(e) {
		// console.log(e);
		var posx = posy = 0;
		if (e.pageX || e.pageY) {
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY)    {
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		target.x = posx;
		target.y = posy - 700;
	}

	function scrollCheck() {
		if(document.body.scrollTop > height) animateHeader = false;
		else animateHeader = true;
	}

	function resize() {
		width = window.innerWidth;
		height = window.innerHeight;
		largeHeader.style.height = height+'px';
		canvas.width = width;
		canvas.height = height;
	}

	function Circle(pos,rad,color) {
		var _this = this;

		// constructor
		(function() {
			_this.pos = pos || null;
			_this.radius = rad || null;
			_this.color = color || null;
		})();

		this.draw = function() {
			if(!_this.active) return;
			ctx.beginPath();// bat dau ve tren canvas
			ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);//ve hinh tron
			ctx.fillStyle = 'rgba(156,217,249,'+ _this.active+')';//dinh mau cho fill
			ctx.fill();//đổ màu lên
		};
	}

	// Util
	function getDistance(p1, p2) {
		return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);//tính số mũ (4,3) => 4*4*4
	}

})();

