var days = 7;
var animationTime = 20;

$('#progress-time-fill, #death-group').css({'animation-duration': animationTime+'s'});

var deadlineAnimation = function () {
	setTimeout(function(){
			$('#designer-arm-grop').css({'animation-duration': '1.5s'});
		},0);

	setTimeout(function(){
			$('#designer-arm-grop').css({'animation-duration': '1s'});
		},4000);

	setTimeout(function(){
			$('#designer-arm-grop').css({'animation-duration': '0.7s'});
		},8000);

	setTimeout(function(){
			$('#designer-arm-grop').css({'animation-duration': '0.3s'});
		},12000);

	setTimeout(function(){
			$('#designer-arm-grop').css({'animation-duration': '0.2s'});
		},15000);
}

function timer(totalTime, deadline) {
	var time = totalTime * 1000;
	var dayDuration = time / deadline;
	var actualDay = deadline;

	var timer = setInterval(countTime, dayDuration);
	
	function countTime() {
		--actualDay;
		$('.deadline-days .day').text(actualDay);

		if (actualDay == 0) {
			clearInterval(timer);
			$('.deadline-days .day').text(deadline);
		}
	}
}

var deadlineText = function () {
	var $el = $('.deadline-days');
	var html = '<div class="mask-red"><div class="inner">' + $el.html() + '</div></div><div class="mask-white"><div class="inner">' + $el.html() + '</div></div>';
	$el.html(html);
}

timer(animationTime, days);

    setInterval(function(){
        timer(animationTime, days);
        deadlineAnimation();

        console.log('begin interval', animationTime * 1000);

    }, animationTime * 1000);

deadlineAnimation();
deadlineText();