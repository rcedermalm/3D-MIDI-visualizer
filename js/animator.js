var Animator = function() {
	var container;
	var camera, scene, renderer;

	var mouseX = 0, mouseY = 0;
	var mouseXnorm = 0, mouseYnorm = 0;
	var cameraRotX = 0, cameraRotY = 0;

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	// Object3D ("Group") nodes and Mesh nodes
	var sceneRoot = new THREE.Group();
	var viewRotation = new THREE.Group();
	var objectMesh;

	var mouseDown = false;

	/////////////////////////////

	var sensitivity = 3;
	var nearestDistance = 3;

	var cameraFOV = 110;

	/////////////////////////////

	var objects = [];

	/////////////////////////////

	function _onWindowResize() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function _onMouseDown(event) {
		mouseDown = true;

		var mousePos = _getMousePos(event);
		mouseXnorm = mousePos.x;
		mouseYnorm = mousePos.y;
	}

	function _onMouseUp() {
		mouseDown = false;

		cameraRotX = viewRotation.rotation.x;
		cameraRotY = viewRotation.rotation.y;
	}

	function _onMouseMove(event) {
		var mousePos = _getMousePos(event);
		mouseX = mousePos.x;
		mouseY = mousePos.y;
	}

	function _onScroll(event) {
		if (event.wheelDeltaY > 0) {
			// User scrolled up
			if (camera.position.z > nearestDistance)
				camera.position.z -= 1;
		} else {
			// User scrolled down
			camera.position.z += 1;
		}
	}

	function _getMousePos(event) {
		// mouseX, mouseY are in the range [-1, 1]
		return {
			x: (event.clientX - windowHalfX) / windowHalfX,
			y: (event.clientY - windowHalfY) / windowHalfY
		}
	}

	function onNoteAdded(note) {
		note.spawn();
		viewRotation.add(note.getOrbit());
		objects.push(note);
	}

	///////////////////////////

	function init() {

		container = document.getElementById('container');

		camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 10000);

		scene = new THREE.Scene();

		// Mesh
		var geometryBox = new THREE.BoxGeometry(1, 1, 1);
		var materialBox = new THREE.MeshBasicMaterial();
		materialBox.wireframe = true;
		objectMesh = new THREE.Mesh(geometryBox, materialBox);

		// Top-level node
		scene.add(sceneRoot);

		// Sun branch
		sceneRoot.add(viewRotation);
		viewRotation.add(objectMesh);


		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor(0x000000);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize( window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		window.addEventListener('resize', _onWindowResize, false);
		window.addEventListener('mousedown', _onMouseDown, false);
		window.addEventListener('mouseup', _onMouseUp, false);
		window.addEventListener('mousemove', _onMouseMove, false);
		window.addEventListener('mousewheel', _onScroll, false);

		// Set up the camera
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 15;
		camera.lookAt( scene.position );

		return this;
	}

	function render(frame) {

		// Perform animations
		if (mouseDown) {
			viewRotation.rotation.x = cameraRotX + (mouseY - mouseYnorm) * sensitivity;
			viewRotation.rotation.y = cameraRotY + (mouseX - mouseXnorm) * sensitivity;
		}

		for (i = 0; i < objects.length; i++) {
			objects[i].animate(frame);
		}

		// Render the scene
		renderer.render(scene, camera);
	}

	return {
		init: init,
		render: render,
		onNoteAdded: onNoteAdded
	}
}