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


	//////////////////////////////////
	//       initialize WebGL       //
	//////////////////////////////////
	console.log('this is working');

	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl');

	if (!gl){
		console.log('webgl not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}
	if (!gl){
		alert('your browser does not support webgl');
	}

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

	drawSurface(0, 0, 0.7, [0.6, 0.8, 1.0, 1.0]);
	
};