'use strict'

var container = document.getElementById( 'container' );

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, .1, 1000 );
camera.position.z = -50;

var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
container.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls( camera, renderer.domElement );

var TAU = 2 * Math.PI;
var hexagonGeometry = new THREE.Geometry();
for( var j = 0; j < TAU - .1; j += TAU / 36 ) {
	var v = new THREE.Vector3();
	v.set( Math.cos( j ), Math.sin( j ), 0 );
	hexagonGeometry.vertices.push( v );
}
hexagonGeometry.vertices.push( hexagonGeometry.vertices[ 0 ].clone() );

function createCurve() {

	var s = new THREE.ConstantSpline();
	var rMin = 1;
	var rMax = 2;
	var origin = new THREE.Vector3( Maf.randomInRange( -rMin, rMin ), Maf.randomInRange( -rMin, rMin ), Maf.randomInRange( -rMin, rMin ) );

	s.inc = .001;
	s.p0 = new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() );
	s.p1 = new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() );
	s.p2 = new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() );
	s.p3 = new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() );
	s.p1 = s.p0.clone().add( new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() ) );
	s.p2 = s.p1.clone().add( new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() ) );
	s.p3 = s.p2.clone().add( new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() ) );
	s.p0.multiplyScalar( rMin + Math.random() * rMax );
	s.p1.multiplyScalar( rMin + Math.random() * rMax );
	s.p2.multiplyScalar( rMin + Math.random() * rMax );
	s.p3.multiplyScalar( rMin + Math.random() * rMax );
	s.p0.copy( origin );
	s.calculate();
	var geometry = new THREE.Geometry();
	s.calculateDistances();
	//s.reticulate( { distancePerStep: .1 });
	s.reticulate( { steps: 500 } );
 	var geometry = new THREE.Geometry();
   
	for( var j = 0; j < s.lPoints.length - 1; j++ ) {
	
		var from = s.lPoints[ j ],
			to = s.lPoints[ j + 1 ];
		geometry.vertices.push( from.clone() );
	    //geometry.vertices.push( to.clone() );
	}

	return geometry;

}

var colors = [
	0xed6a5a,
	0xf4f1bb,
	0x9bc1bc,
	0x5ca4a9,
	0xe6ebe0,
	0xf0b67f,
	0xfe5f55,
	0xd6d1b1,
	0xc7efcf,
	0xeef5db,
	0x50514f,
	0xf25f5c,
	0xffe066,
	0x247ba0,
	0x70c1b3
];

var lines = [];
var strokeTexture = THREE.ImageUtils.loadTexture( 'assets/stroke.png' );
var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

function makeLine( geo ) {

	var g = prepareGeometry( geo, true );

	var material = new THREE.RawShaderMaterial( { 
		uniforms:{
			lineWidth: { type: 'f', value: 10 },
			map: { type: 't', value: strokeTexture },
			useMap: { type: 'f', value: 0 },
			color: { type: 'c', value: new THREE.Color( colors[ ~~Maf.randomInRange( 0, colors.length ) ] ) },
			resolution: { type: 'v2', value: resolution },
			near: { type: 'f', value: camera.near },
			far: { type: 'f', value: camera.far }	
		},
		vertexShader: document.getElementById( 'vs-line' ).textContent,
		fragmentShader: document.getElementById( 'fs-line' ).textContent,
		//transparent: true,
		//depthTest: false,
		//blending: THREE.AdditiveAlphaBlending
	});
	var mesh = new THREE.Mesh( g, material );
	var s = 10 +  10 * Math.random()
	mesh.scale.set( s,s,s );
	mesh.rotation.set( Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI );
	scene.add( mesh );

	lines.push( mesh );

}

/*
for( var j = 0; j < 100; j++ ) {
	makeLine();
}
*/
function m() {
	//makeLine( hexagonGeometry );
	makeLine( createCurve() );
}
m();

window.addEventListener( 'keydown', m );
onWindowResize();

function onWindowResize() {

	var w = container.clientWidth;
	var h = container.clientHeight;

	container.style.left = .5 * ( window.innerWidth - w ) + 'px';

	camera.aspect = w / h;
	camera.updateProjectionMatrix();

	renderer.setSize( w, h );

	resolution.set( w, h );

}

window.addEventListener( 'resize', onWindowResize );

var tmpVector = new THREE.Vector3();

function render() {

	requestAnimationFrame( render );
	controls.update();

	var t = .01 *Date.now();
	lines.forEach( function( l, i ) {
		//l.material.uniforms.lineWidth.value = 10 + 5 * Math.sin( t + i );
	} );
	renderer.render( scene, camera );
	//manager.render( scene, camera );

}
render();