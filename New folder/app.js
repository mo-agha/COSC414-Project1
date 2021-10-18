var vertexShaderText = [

    'attribute vec3 vertPosition;',
    
    '',
    
    'void main()',
    '{',
    '	gl_Position = vec4(vertPosition, 1.0);',
    '}'
    ].join('\n');
    
    var fragmentShaderText =
    [
    'precision mediump float;',
    'uniform vec4 fcolor;',
    
    '',
    'void main()',
    '{',
        
    '	gl_FragColor = fcolor;',
    '}',
    ].join('\n')
    
    
    var demo = function() {

        var score = 0;
	var missClicks = 0;
	var winKillAmt = 15;
	var bacRemaining = winKillAmt;
	var lives = 2;
	var spawnedBac = 0;
	var clickedPoints = [];
	var particles = [];
	var reduceVariable = 90;
	// Set radius and size for game-circle
	var r=0.8;
	var i=0.5;
	// Variables for Bacteria data
	var totBac = 10;
	var bacArr = [];
	var rAngle = 0;
	var tempXY = [];
    
    
        //////////////////////////////////
        //       initialize WebGL       //
        //////////////////////////////////
        console.log('this is working');
    
        var canvas = document.getElementById('game-surface');
        var gl = canvas.getContext('webgl');
    
        gl.viewport(0,0,canvas.width,canvas.height);
    
        
    
        //////////////////////////////////
        // create/compile/link shaders  //
        //////////////////////////////////
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    
        gl.shaderSource(vertexShader,vertexShaderText);
        gl.shaderSource(fragmentShader,fragmentShaderText);
    
        gl.compileShader(vertexShader);
        if(!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)){
            console.error('Error compiling vertex shader!', gl.getShaderInfoLog(vertexShader))
            return;
        }
        gl.compileShader(fragmentShader);
            if(!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)){
            console.error('Error compiling vertex shader!', gl.getShaderInfoLog(fragmentShader))
            return;
        }
    
        var program = gl.createProgram();
        gl.attachShader(program,vertexShader);
        gl.attachShader(program,fragmentShader);
    
        gl.linkProgram(program);
        if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
            console.error('Error linking program!', gl.getProgramInfo(program));
            return;
        }
    
        //////////////////////////////////
        //      create disk buffer      //
        //////////////////////////////////
    
        var diskVertexBufferObject = gl.createBuffer();
        //set the active buffer to the triangle buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, diskVertexBufferObject);
        //gl expecting Float32 Array not Float64
    
        var positionAttribLocation = gl.getAttribLocation(program,'vertPosition');
        var fragColor = gl.getUniformLocation(program, 'fcolor');
        gl.vertexAttribPointer(
            positionAttribLocation, //attribute location
            3, //number of elements per attribute
            gl.FLOAT, 
            gl.FALSE,
            0*Float32Array.BYTES_PER_ELEMENT,//size of an individual vertex
            0*Float32Array.BYTES_PER_ELEMENT//offset from the beginning of a single vertex to this attribute
            );
        gl.enableVertexAttribArray(positionAttribLocation);
    
        gl.useProgram(program);
    
        function drawSurface(x_coord, y_coord, radius, surfaceColor) {
    
            // Creating game surface disk 
    
            // Array to hold surface vertices 
            var diskVertices = [];
    
            // Loop to add vertices that covers whole disk (up till 360 degrees)
            for (let i = 1; i <= 360; i++) {
                
                diskVertices.push(x_coord);
                diskVertices.push(y_coord);
                diskVertices.push(0);
    
                diskVertices.push(radius*Math.cos(i)+x_coord);
                diskVertices.push(radius*Math.sin(i)+y_coord);
                diskVertices.push(0);
    
                diskVertices.push(radius*Math.cos(i+1)+x_coord);
                diskVertices.push(radius*Math.sin(i+1)+y_coord);
                diskVertices.push(0);
                
            }
    
        //////////////////////////////////
        //            Drawing           //
        //////////////////////////////////
            
        //gl.STATIC_DRAW means we send the data only once (the triangle vertex position
        //will not change over time)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diskVertices),gl.STATIC_DRAW);
    
        // Passing color information to fragColor
        gl.uniform4f(fragColor, surfaceColor[0], surfaceColor[1], surfaceColor[2], surfaceColor[3]);
        
        // Clear colors and <canvas>
        gl.clearColor(1.0,1.0,1.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    
        // Draw
        gl.drawArrays(gl.TRIANGLES,0,360*3);
        
        }

        // Pythagorean theorem
	function distance(x1, y1, x2, y2) {
		var xDist = x2-x1;
		var yDist = y2-y1;
		return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
	}

    function randomSign(n){
		if(Math.random() >= 0.5){
			n = n*-1;
		}
		return n;
    }
    
        class Bacteria {

            constructor(identifier, living) {
                this.identifier = identifier;
                this.living = false;
               // this.consuming = []; 
            }
    
            generate() {
    
                // get new random data for determining x and y
                this.getNewRandomTrigData();
    
                // get new x and y values along the game circle
                this.getCircPoints();
    
                // Store new data for each Bacteria
                this.r = 0.06;
                this.living = true;
                // times by 0.65 to ensure the bacteria isn't as light as the canvas
                this.color = [Math.random() * (0.65), Math.random() * (0.65), Math.random() * (0.65), 0.75];
                this.living = true;
                
                spawnedBac++;
            }
    
            update() {
    
                if(this.living) {
                    // If a certain threshold (r=0.3) destroy the bacteria and decrease player's lives
                    if(this.r > 0.3) {
                        lives--;
                        this.destroy(bacArr.indexOf(this));
                    } else {
                        // Increase the size of each bacteria by 0.0003 each tick
                            this.r += 0.0003;
                        //increase alpha as bacteria grows
                        this.color[3] += 0.0003;        
                    }
                    // Draw
                    draw_circle(this.x, this.y, this.r, this.color);
                }
            }
    
            destroy(index) {
                // Set radius to zero to open up more potential respawn points
                this.r = 0;
                this.x = 0;
                this.y = 0;
                this.living = false;
                bacRemaining--;
    
    
                // Spawn new bacteria
                if(bacRemaining >= totBac) {
                    bacArr.push(new Bacteria(spawnedBac));
                    bacArr[totBac-1].generate();
                }
            }
    
            // Get random values for variables determining x and y coordinates
            getNewRandomTrigData() {
                this.angle = Math.random();
                this.spawnRadX = randomSign(0.8);
                this.spawnRadY = randomSign(0.8);
                if(Math.random() >= 0.5) {
                    this.trig = "sin";
                } else {
                    this.trig = "cos";
                }
            }
    
            getCircPoints() {
                var tempX, tempY;
                // Allows for posibility to spawn along any point of the circumference
                if (this.trig == "sin") {
                    this.x = this.spawnRadX*Math.sin(this.angle);
                    this.y = this.spawnRadY*Math.cos(this.angle);
                } else {
                    this.x = this.spawnRadX*Math.cos(this.angle);
                    this.y = this.spawnRadY*Math.sin(this.angle);
                }
            }
        } // End of Bacteria class

        // Assign function to mouse click
	canvas.onmousedown = function(e, canvas){click(e, gameSurface);};

	// Function click
	function click(e, canvas) {
		let x = e.clientX;
		let y = e.clientY;
		let start = y;
		let hit = false;
		let ptsInc = 0;
		const rect = e.target.getBoundingClientRect();
		//Convert default canvas coords to webgl vector coords
		x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
		y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

		// Loop through all bacteria and check if you clicked within the radius of any
		// Increase score and destroy the bacteria
		for(let i in bacArr) {
			if(distance(x, y, bacArr[i].x, bacArr[i].y) - (0 + bacArr[i].r) < 0){
				ptsInc = Math.round(1/bacArr[i].r);
				createExplosionAtBacteria(bacArr[i]);
 			 	score += ptsInc;
				bacArr[i].destroy(i);
 			 	hit = true;
				clickedPoints.push({
					pts: "+" + ptsInc,
					x: e.clientX,
					y: e.clientY,
					dY: 0,
					color: "rgba(0,200,0,"
				});
			 	// Break ensures you can't click multiple bacteria at once
			 	break;
			 }
		}

		// If you click and don't hit a bacteria, your score is decreased by 20 + the total amount of times you've clicked.
		if(!hit && bacRemaining != 0) {
			missClicks ++;
			clickedPoints.push({
				pts: -20 - missClicks,
				x: e.clientX,
				y: e.clientY,
				dY: 0,
				color: "rgba(255,0,0,"
			});
			score -= (20 + missClicks);
		}
	}

        for(var i = 0; i<totBac; i++){
            bacArr.push(new Bacteria(spawnedBac));
            bacArr[i].spawn();
        }

        function winCondition(){
            if(lives > 0 && bacRemaining <= 0) {
               ctx.clearRect(0, 0, canvas.width, canvas.height);
               clickedPoints = [];
               particles = [];
               ctx.fillStyle = "rgba(0, 255, 0, 1.0)";
               ctx.font = "80px Verdana";
               ctx.fillText("You win!", 300, 300);
                return true;
            }
           return false;
       }
   
       function loseCondition(){
           if(lives<=0) {
               ctx.clearRect(0, 0, canvas.width, canvas.height);
               ctx.font = "80px Verdana";
               ctx.fillStyle = "red";
               ctx.fillText("Game over", 300, 300);
               ctx.font = "40px Verdana";
               ctx.fillText("You lose...", 310, 355);
               return true;
           }
           return false;
       }
    
       function gameLoop() {
		// Updates the score span element in the html
		document.getElementById('scoreDisplay').innerHTML=score;
		document.getElementById('bacRemaining').innerHTML=bacRemaining;
		document.getElementById('lives').innerHTML=lives;

		if(!winCondition() && lives > 0) {
			for (let i in bacArr) {
					bacArr[i].update();
					if (loseCondition()) {
						bacRemaining = 0;
						break;
					}
				}

				// Used for displaying points awarded on clicks
				for(i in clickedPoints) {
					// Variable for change in y position of each point
					clickedPoints[i].dY--;
					// If the point's y has changed by 50, remove the point from the array
					if(clickedPoints[i].dY <= -50){
						clickedPoints.splice(i,1);
					} else {
						// Clear canvas only around specific text
						ctx.clearRect(clickedPoints[i].x - 25, clickedPoints[i].y + clickedPoints[i].dY - 20, clickedPoints[i].x + 20, clickedPoints[i].y + 20);
						// Alpha of the points approaches zero as it reaches its max change in y to simulate a fade out
						ctx.fillStyle = clickedPoints[i].color + (1.0 - (clickedPoints[i].dY * -0.02) + ")");
						// Print the points awarded and move them upwards
						ctx.fillText(clickedPoints[i].pts, clickedPoints[i].x, clickedPoints[i].y + clickedPoints[i].dY);
					}
				}

				// Loop through all particles to draw
				pCtx.clearRect(0, 0, canvas.width, canvas.height);
				for(i in particles) {
					particles[i].draw();
				}
				// Just to ensure the game over text is printed. Need to fix this mess up.
				loseCondition();
			}

		// Draw the game surface circle
		draw_circle(0,0,0.8,[0.05, 0.1, 0.05, 0.5]);
		requestAnimationFrame(gameLoop);
	}
	requestAnimationFrame(gameLoop);
        
    }
