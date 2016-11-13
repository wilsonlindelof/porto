window.onload = function() {
	
	function generateBlankPixels(width, height) {
		var blankPixels = {}; 
		for (var x = 0; x < width; x++) {
			blankPixels[x] = {};
			for (var y = 0; y < height; y++) {
				blankPixels[x][y] = {};
				makeWater(blankPixels, x, y, width, height);
			}
		}
		return blankPixels;
	}
	
	function createIslands(pixels, width, height) {		
		
		var numberOfIslands = 1;//(width / 100);
		var maximumWidth = width - 10;
		var maximumHeight = height - 10;
		var minimum = 10;
		
		var roughMax = 120;
		var roughMin = 40;
		var islands = [];
		for (var i = 0; i < numberOfIslands; i++) {
			var x = Math.floor(Math.random() * (maximumWidth - minimum + 1)) + minimum;
			var y = Math.floor(Math.random() * (maximumHeight - minimum + 1)) + minimum;
			var roughWidth = Math.floor(Math.random() * (roughMax - roughMin + 1)) + roughMin;
			var roughHeight = Math.floor(Math.random() * (roughMax - roughMin + 1)) + roughMin;
			var island = {};
			var topLeft = {
				'x': x - Math.floor((roughWidth / 2)),
				'y': y - Math.floor((roughHeight / 2))
			};
			var current = {
				'x': topLeft['x'],
				'y': topLeft['y']
			};
			makeSand(pixels, current['x'], current['y'], width, height);
			for (var trav_x = 0; trav_x < roughWidth; trav_x++) {
				old = {
					'x': current['x'],
					'y': current['y']
				};				
				current['x'] = current['x'] + 1;
				current['y'] = current['y'] + randoNoise();
				traverse(pixels, current, old, width, height, island, makeSand);
				//makeSand(pixels, current['x'], current['y'], width, height);
			}
			
			for (var trav_y = 0; trav_y < roughHeight; trav_y++) {
				old = {
					'x': current['x'],
					'y': current['y']
				};
				current['y'] = current['y'] + 1;
				current['x'] = current['x'] + randoNoise();
				traverse(pixels, current, old, width, height, island, makeSand);
			}
			
			for (var trav_x = 0; trav_x < roughWidth; trav_x++) {
				old = {
					'x': current['x'],
					'y': current['y']
				};
				current['x'] = current['x'] - 1;
				current['y'] = current['y'] + randoNoise();
				traverse(pixels, current, old, width, height, island, makeSand);
			}
			
			for (var trav_y = 0; trav_y < roughHeight; trav_y++) {
				old = {
					'x': current['x'],
					'y': current['y']
				};
				current['y'] = current['y'] - 1;
				current['x'] = current['x'] + randoNoise();
				traverse(pixels, current, old, width, height, island, makeSand);
			}
			
			traverse(pixels, topLeft, current, width, height, island, makeSand);
			islands.push(island);
		}
		
		for (var i = 0; i < numberOfIslands; i++) {
			var island = islands[i];
			var xKeys = Object.keys(island);
			for (var j = 0; j < xKeys.length; j++) {
				var x = +(xKeys[j]);
				var yKeys = (Object.keys(island[x])).sort(function(a,b){return a - b});
				for (var l = 0; l < yKeys.length; l++) {
					var y = +(yKeys[l]);
					if ((l + 1) < yKeys.length) {//if there is at least 1 more up
						var y2 = +(yKeys[l + 1]);
						if ((Math.abs(y2 - y)) > 1) {//so if they are NOT right next to each other dont draw
							var current2 = {
								'x': +(x),
								'y': (+(y2) - 1)
							}
							var old2 = {
								'x': +(x),
								'y': (+(y) + 1)
							}
							makeGrass(pixels, old2['x'], old2['y'], width, height);//if there is exactly one space between, this will be all that happens. otherwise, it will do this and traverse will do stuff too.
							traverseBounded(pixels, current2, old2, width, height, island, makeGrass);
						}
					}
				}
			}
		}
		
		return pixels;
	}
	
	function traverse(pixels, current, old, width, height, island, func) {
		var x_diff = Math.abs(current['x'] - old['x']);
		var y_diff = Math.abs(current['y'] - old['y']);		
		if (!(old['x'] in island)) {
			island[old['x']] = {};
		}
		island[old['x']][old['y']] = 1;		
		
		if (x_diff >= y_diff) {//do x first
			if (current['x'] > old['x']) {
				old['x'] = old['x'] + 1;
				func(pixels, old['x'], old['y'], width, height);
			} else {
				old['x'] = old['x'] - 1;
				func(pixels, old['x'], old['y'], width, height);
			}
		} else { //do y
			if (current['y'] > old['y']) {
				old['y'] = old['y'] + 1;
				func(pixels, old['x'], old['y'], width, height);
			} else {
				old['y'] = old['y'] - 1;
				func(pixels, old['x'], old['y'], width, height);
			}
		}
		if (current['x'] == old['x'] && current['y'] == old['y']) {
			return;
		} else {
			return traverse(pixels, current, old, width, height, island, func);
		}
		
	}
	
	function bounded(island, x, y, width, height) {//just simplify this and make it so it has to have an x left and right and a y above and below
		console.log('x');
		if (!(coordsOk(x, y, width, height))) {
			return false;
		}
		var yKeys = (Object.keys(island[x])).sort(function(a,b){return a - b});
		var yIntersects = 0;
		for (var i = 0; i < yKeys.length; i++) {
			if (yKeys[i] < y) {
				if (!(yKeys[i - 1]) || (Math.abs((yKeys[i] - yKeys[i - 1])) > 1)) {//if its the first intersect or the previous thing was more than 1 away
					yIntersects += 1;
				}				
			}
		}		
		var yBounded = !(yIntersects % 2 == 0);
		
		var xInsersects = 0;
		var xKeys = (Object.keys(island)).sort(function(a,b){return a - b});
		for (var j = 0; j < xKeys.length; j++) {
			if ((xKeys[j] < x) && island[xKeys[j]][y]) {
				if (!(xKeys[j - 1]) || (Math.abs((xKeys[j] - xKeys[j - 1])) > 1)) {//if its the first intersect or the previous thing was more than 1 away
					xInsersects += 1;
				}				
			}
		}
		var xBounded = !(xInsersects % 2 == 0);
		
		return xBounded && yBounded;
	}
	
	function traverseBounded(pixels, current, old, width, height, island, func) {
		var x_diff = Math.abs(current['x'] - old['x']);
		var y_diff = Math.abs(current['y'] - old['y']);						
		
		if (x_diff >= y_diff) {//do x first
			if (current['x'] > old['x']) {
				old['x'] = old['x'] + 1;
				if (bounded(island, old['x'], old['y'], width, height)) {
					func(pixels, old['x'], old['y'], width, height);
				}				
			} else {
				old['x'] = old['x'] - 1;
				func(pixels, old['x'], old['y'], width, height);
				if (bounded(island, old['x'], old['y'], width, height)) {
					func(pixels, old['x'], old['y'], width, height);
				}
			}
		} else { //do y
			if (current['y'] > old['y']) {
				old['y'] = old['y'] + 1;
				func(pixels, old['x'], old['y'], width, height);
				if (bounded(island, old['x'], old['y'], width, height)) {
					func(pixels, old['x'], old['y'], width, height);
				}
			} else {
				old['y'] = old['y'] - 1;
				func(pixels, old['x'], old['y'], width, height);
				if (bounded(island, old['x'], old['y'], width, height)) {
					func(pixels, old['x'], old['y'], width, height);
				}
			}
		}
		if (current['x'] == old['x'] && current['y'] == old['y']) {
			return;
		} else {
			return traverse(pixels, current, old, width, height, island, func);
		}
		
	}
	
	function randoNoise() {
		return (Math.random() < .03 ? 1 : 0) + (Math.random() < .03 ? 1 : 0) + (Math.random() < .03 ? -1 : 0) + (Math.random() < .01 ? -3 : 0) + (Math.random() < .03 ? -1 : 0) + (Math.random() < .03 ? -1 : 0) + (Math.random() < .03 ? 1 : 0) + (Math.random() < .01 ? 4 : 0);
	}
	
	function coordsOk(x, y, width, height) {
		return ((x > 0) && (x < width - 1) && (y > 0) && (y < height - 1));
	}
	
	function makeWater(pixels, x, y, width, height) {
		if (coordsOk(x, y, width, height)) {
			pixels[x][y]['red'] = 0;
			pixels[x][y]['green'] = 88;
			pixels[x][y]['blue'] = 248;
			pixels[x][y]['alpha'] = 255;
		}
	}
	
	function makeGrass(pixels, x, y, width, height) {
		if (coordsOk(x, y, width, height)) {
			pixels[x][y]['red'] = 0;
			pixels[x][y]['green'] = 104;
			pixels[x][y]['blue'] = 0;
			pixels[x][y]['alpha'] = 255;
		}		
	}
	
	function makeSand(pixels, x, y, width, height) {
		if (coordsOk(x, y, width, height)) {
			pixels[x][y]['red'] = 248;
			pixels[x][y]['green'] = 216;
			pixels[x][y]['blue'] = 120;
			pixels[x][y]['alpha'] = 255;
		}		
	}
	
	function createImage(pixels, width, height, imagedata) {
				
		for (var x = 0; x < width; x++) {
			for (var y = 0; y < height; y++) {
				var pixelindex = (y * width + x) * 4;
				
				imagedata.data[pixelindex] = pixels[x][y]['red'];
				imagedata.data[pixelindex + 1] = pixels[x][y]['green'];
				imagedata.data[pixelindex + 2] = pixels[x][y]['blue'];
				imagedata.data[pixelindex + 3] = pixels[x][y]['alpha'];
			}
		}
				
    }
	
	function main() {
		
		var canvas = document.getElementById("viewport");
		var context = canvas.getContext("2d");
		
		var width = canvas.width;
		var height = canvas.height;
		
		var imagedata = context.createImageData(width, height);		
		
		//pixels is now black background
		var pixels = generateBlankPixels(width, height);
		pixels = createIslands(pixels, width, height);
		createImage(pixels, width, height, imagedata);
		context.putImageData(imagedata, 0, 0);
	}
	
	main();
	
}