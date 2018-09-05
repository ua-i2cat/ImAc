
var camera;
var scene;

function AplicationManager()
{
    var controls;
    var container;
    var renderer;
    var effect;
    var isVRtested = false;
    var haveVrDisplay = false;

    var gamepad;

    var _display;


    this.init_AplicationManager = function()
    {
        init();
		waitSesionManager();	
    };

    this.switchDevice = function()
    {
    	if ( _display.length > 0 ) 
    	{
    		if ( _isHMD )
    		{
    			_isHMD = false;
    			_display[ 0 ].isPresenting ? _display[ 0 ].exitPresent() : _display[ 0 ].requestPresent( [ { source: renderer.domElement } ] ).then(
				function () { 
					isVRtested=true; 
					startAllVideos(); 
					controls = new THREE.DeviceOrientationAndTouchController( camera, renderer.domElement, renderer );
				});
    		}
    		else
    		{
    			_isHMD = true;;
    			controls = undefined;
    			_display[ 0 ].isPresenting ? _display[ 0 ].exitPresent() : _display[ 0 ].requestPresent( [ { source: renderer.domElement } ] ).then(
				function () { 
					isVRtested=true; 
					startAllVideos();
				});

				renderer.vr.setDevice( _display[ 0 ] );

    		}
		}
    };

	function waitSesionManager()
	{ 
		if (isVRtested == true)
		{
			activateLogger();
			haveVrDisplay ? renderer.animate( render ) : update(); 
		}
		else
		{
			requestAnimationFrame( waitSesionManager );
		}
	}

	function activateLogger()
	{
		if (loggerActivated)
		{
			setInterval(function(){
				statObj.add(new StatElements());
			}, 500);
		}
	}

	function update() 
	{	
		if(controls) controls.update();
		effect.render( scene, camera );
		requestAnimationFrame( update );		
    }

    function render()
    {
    	if ( gamepad ) gamepad.update();
    	if ( controls ) controls.update();
    	//THREE.VRController.update()
    	renderer.render( scene, camera );

    	if ( AudioManager.isAmbisonics ) AudioManager.updateRotationMatrix( camera.matrixWorld.elements );

    	if(gamepad && gamepad.getTouchPadState() && _isHMD) 
    	{
            var mouse3D = new THREE.Vector2();
	        mouse3D.x = 0;
	        mouse3D.y = 0;
					
			//moData.isPausedById(0) ? moData.playAll() : moData.pauseAll();
			interController.checkInteraction(mouse3D, camera, 'onDocumentMouseDown');
		}

		// If the device is in HMD mode and the menu is open, the menu will follow the FoV of the user

		var menu;
    	if(_isTradMenuOpen) menu = scene.getObjectByName( "traditionalMenu" );
    	else menu  = scene.getObjectByName(menuList[0].name)

	    if(_isHMD && menu)
	    {
	        MenuManager.menuFollowCameraFOV(Math.sign(Math.round(Math.degrees(camera.rotation.y))%360), menu);
	    } 

		Reticulum.update();
    }

    function init() 
    {
		console.log("[AplicationManager]  init");
	
		blockContainer();
			
		container = document.getElementById( 'container' );
	
        camera = new THREE.PerspectiveCamera( 60.0, window.innerWidth / window.innerHeight, 0.05, 1000 );
        camera.name = 'perspectivecamera';


 		var openMenuText = menuData.getMenuTextMesh("Menu", 22, 0xff0000, "openmenutext");
 		openMenuText.position.y = 6;
 		openMenuText.position.z = -60;
 		openMenuText.scale.set(0.15, 0.15, 1)
 		openMenuText.visible = false;

 		camera.add(openMenuText);

        this.CameraParentObject = new THREE.Object3D();
        this.CameraParentObject.name = 'parentcamera';
		this.CameraParentObject.add(camera);

		scene = new THREE.Scene();
		scene.add(this.CameraParentObject);

		renderer = new THREE.WebGLRenderer({
			antialias:true,
			premultipliedAlpha: false,
			alpha: true
		});

		renderer.domElement.id = 'YourIDName';

		renderer.sortObjects = true;

		renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
		renderer.setSize( window.innerWidth, window.innerHeight );

		container.appendChild( renderer.domElement );

        moData.createSphericalVideoInScene( mainContentURL, 'contentsphere' );

        //moData.createCubeGeometry116('./resources/cubemap3.jpg', 'name');
        //moData.createCubeGeometry65('./resources/dagomi_cube_603_edit.mp4', 'name');

        if ( 'getVRDisplays' in navigator ) {

        	document.body.appendChild( WEBVR.createButton( renderer ) );
        	document.body.appendChild( WEBVR.createButton2( renderer ) );


        	navigator.getVRDisplays().then( function ( displays ) 
        	{
				_display = displays;
				haveVrDisplay = true;
				renderer.vr.enabled = true;
				isVRtested = true; 
				startAllVideos();
			} );
        }
        else
        {
        	startAllVideos();
			isVRtested = true;

			effect = new THREE.StereoEffect(renderer);
			effect.setSize(window.innerWidth, window.innerHeight);

			controls = new THREE.DeviceOrientationAndTouchController(camera, renderer.domElement, renderer);
        }

		Reticulum.init(camera, {
			proximity: false,
			clickevents: true,
			reticle: {
				visible: true,
				restPoint: 50, //Defines the reticle's resting point when no object has been targeted
				color: 0xffff00,
				innerRadius: 0.0004,
				outerRadius: 0.003,
				hover: {
					color: 0x13ec56,
					innerRadius: 0.02,
					outerRadius: 0.024,
					speed: 5,
					vibrate: 50 //Set to 0 or [] to disable
				}
			},
			fuse: {
				visible: false,
				duration: 3,
				color: 0xff0000,
				innerRadius: 0.045,
				outerRadius: 0.06,
				vibrate: 100, //Set to 0 or [] to disable
				clickCancelFuse: false //If users clicks on targeted object fuse is canceled
			}
		});

	}

	var WEBVR = {

		button1: undefined,
		button2: undefined,

		createButton: function ( renderer ) {

			function showEnterVR( display ) {

				button.style.display = '';

				button.style.cursor = 'pointer';
				button.style.left = 'calc(50% - 110px)';
				button.style.width = '100px';

				button.textContent = 'ENTER VR!';

				button.onmouseenter = function () { button.style.opacity = '1.0'; };
				button.onmouseleave = function () { button.style.opacity = '0.5'; };

				button.onclick = function () {

					button1.style.display = 'none';
					button2.style.display = 'none';
					startAllVideos();

					display.isPresenting ? display.exitPresent() : display.requestPresent( [ { source: renderer.domElement } ] ).then(
						function () { 
							gamepad = new THREE.DaydreamController( camera, renderer.domElement );
							isVRtested=true; 
							startAllVideos(); 
							_isHMD = true; 
							//document.body.appendChild( WEBVR.createButton( renderer ) );   		 		

						 		/*gamepad = new THREE.DaydreamController(renderer.domElement);
								gamepad.position.set( 0.025, - 0.05, 0 );
								gamepad.position.z = - 1;
								gamepad.renderOrder = 10;

								scene.add( gamepad );*/
						});
				};

				renderer.vr.setDevice( display );

			}

			if ( 'getVRDisplays' in navigator ) {

				var button = document.createElement( 'button' );
				button.style.display = 'none';

				stylizeElement( button );

				/*window.addEventListener( 'vrdisplayconnect', function ( event ) {

					showEnterVR( event.display );

				}, false );

				window.addEventListener( 'vrdisplaypresentchange', function ( event ) {
					
					//if (!event.display.isPresenting) window.history.back();
					if (event.display) {
						button.textContent = event.display.isPresenting ? 'EXIT VR' : 'ENTER VR';

						if (!event.display.isPresenting) location.reload();
					}

				}, false );

				window.addEventListener( 'vrdisplayactivate', function ( event ) {

					event.display.requestPresent( [ { source: renderer.domElement } ] ).then(function () { isVRtested = true; startAllVideos(); });

				}, false );*/

				navigator.getVRDisplays()
					.then( function ( displays ) {

						_display = displays;

						if ( displays.length > 0) 
						{
							showEnterVR( displays[ 0 ] );
						}
						else
						{
							controls = new THREE.DeviceOrientationAndTouchController( camera, renderer.domElement, renderer );
						}
					} );

				button1 = button;

				return button;

			}
		},

		createButton2: function ( renderer ) {

			function showEnterVR() {

				button.style.display = '';

				button.style.cursor = 'pointer';
				button.style.left = 'calc(50% + 10px)';
				button.style.width = '100px';

				button.textContent = 'NO ENTER VR!';

				button.onmouseenter = function () { button.style.opacity = '1.0'; };
				button.onmouseleave = function () { button.style.opacity = '0.5'; };

				button.onclick = function () {

					button1.style.display = 'none';
					button2.style.display = 'none';

					controls = new THREE.DeviceOrientationAndTouchController( camera, renderer.domElement, renderer );
					
					isVRtested=true; 
					startAllVideos(); 
					_isHMD = false; 

				};
			}

			var button = document.createElement( 'button' );
			button.style.display = 'none';

			stylizeElement( button );


			if ( 'getVRDisplays' in navigator ) {

				navigator.getVRDisplays().then( function ( displays ) 
				{
					if ( displays.length > 0) 
					{
						showEnterVR();
					}
				} );

				button2 = button;

				return button;
			}

		}
	};
}

function stylizeElement( element ) 
{
	element.style.position = 'absolute';
	element.style.bottom = '200px';
	element.style.padding = '12px 6px';
	element.style.border = '1px solid #fff';
	element.style.borderRadius = '4px';
	element.style.background = 'transparent';
	element.style.color = '#fff';
	element.style.font = 'normal 13px sans-serif';
	element.style.textAlign = 'center';
	element.style.opacity = '0.5';
	element.style.outline = 'none';
	element.style.zIndex = '999';
}