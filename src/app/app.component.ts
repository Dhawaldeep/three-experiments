import { Component, ViewChild, OnInit, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, Vector3, AxesHelper, DirectionalLight, Raycaster, Mesh, Color, Group, FontLoader, MeshBasicMaterial, DoubleSide, ShapeBufferGeometry } from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import {GLTFLoader, GLTF} from 'three/examples/jsm/loaders/GLTFLoader';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Experments with GLTF Loader';
  @ViewChild('scene', {static: false}) container: ElementRef;

  scene: Scene;
  camera: PerspectiveCamera;
  controls: OrbitControls;
  renderer: WebGLRenderer;
  alight: AmbientLight;
  dlight: DirectionalLight
  gltfModelLoder: GLTFLoader;
  fontLoader: FontLoader;
  axisHelper: AxesHelper;
  globe: Scene;
  pplane: Scene;
  group: Group;
  raycaster: Raycaster;
  angleVal: number = 0;

  ngOnInit(){
    this.scene = new Scene();
    this.group = new Group();
    this.scene.add(this.group)
    this.scene.background = new Color(0x2BB0D7);
    this.alight = new AmbientLight();
    this.alight.intensity = 5;
    this.scene.add(this.alight);
    this.dlight = new DirectionalLight();
    // this.scene.add(this.dlight);
    this.gltfModelLoder = new GLTFLoader();
    this.fontLoader = new FontLoader();
    this.raycaster = new Raycaster();
  }

  ngAfterViewInit(){
    const {clientWidth, clientHeight} = this.container.nativeElement;
    this.camera = new PerspectiveCamera(45, clientWidth/clientHeight, 0.1, 100);
    this.scene.add(this.camera);
    this.gltfModelLoder.load('assets/earth_2/scene.gltf', (gltf)=>{
      console.log(gltf);
      this.globe = gltf.scene;
      this.globe.position.set(0,0,0);
      this.globe.rotation.y = Math.PI;
      this.globe.traverse(entity=>{
        if(entity instanceof Mesh){
          entity.geometry.computeBoundingSphere();
          const radius = entity.geometry.boundingSphere.radius;
          this.camera.position.set(radius,0,4*radius);
        }
      })
      this.group.add(this.globe)
      // this.dlight.target = this.globe;
      this.camera.lookAt(this.globe.position);
      this.fontLoader.load('assets/fonts/helvetiker_regular.typeface.json', (font)=>{
          let xMid, text: Mesh;
		  		let color = new Color( 0x006699 );
		  		let matDark = new MeshBasicMaterial( {
		  			color: color,
		  			side: DoubleSide
		  		} );
		  		// let matLite = new MeshBasicMaterial( {
		  		// 	color: color,
		  		// 	transparent: true,
		  		// 	opacity: 0.4,
		  		// 	side: DoubleSide
		  		// } );
		  		let message = "Travels\n Maker";
		  		let shapes = font.generateShapes( message, 0.5, 0 );
		  		let geometry = new ShapeBufferGeometry( shapes );
		  		geometry.computeBoundingBox();
		  		xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
		  		geometry.translate( xMid, 0, 0 );
		  		// make shape ( N.B. edge view not visible )
          text = new Mesh( geometry, matDark );
          text.position.x = 2.5;
		  		this.scene.add( text );
      })
    }, (ev)=>{
      console.log(ev)
    }, err=>{
      console.log(err)
    })
    this.gltfModelLoder.load('assets/propeller_plane/scene.gltf', (gltf)=>{
      console.log(gltf);
      this.pplane = gltf.scene;
      this.pplane.position.set(0.8,0.5,0.8);
      this.pplane.scale.set(0.02,0.02,0.02);
      this.pplane.rotation.z = -Math.PI/2;
      this.pplane.rotation.y = Math.PI/2;

      // this.pplane.traverse(entity=>{
      //   if(entity instanceof Mesh){
      //     entity.geometry.computeBoundingSphere();
      //     const radius = entity.geometry.boundingSphere.radius;
      //     this.camera.position.set(radius,radius,radius);
      //   }
      // })
      this.group.add(this.pplane)
    }, (ev)=>{
      console.log(ev)
    }, err=>{
      console.log(err)
    })
    this.renderer = new WebGLRenderer({antialias: true});
    this.renderer.setSize(clientWidth,clientHeight);
    this.container.nativeElement.append(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target = new Vector3(0,0,0);
    // this.controls.enableZoom = false;
    this.render();
  }

  render(){
    requestAnimationFrame(()=>{
      this.render()
    })
    this.renderer.render(this.scene, this.camera);
    // if(this.globe) this.group.rotation.y += 0.01;
    // if(this.globe) this.globe.rotation.y += 0.005;
    if(this.pplane){
      this.pplane.rotation.y += 0.01;
      this.pplane.position.x = 1.3*Math.sin(this.angleVal);
      this.pplane.position.z = 1.3*Math.cos(this.angleVal);
      this.angleVal += 0.01;
    }
  }

  resize(){
    this.camera.aspect = this.container.nativeElement.clientWidth/ this.container.nativeElement.clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.container.nativeElement.clientWidth,this.container.nativeElement.clientHeight)
  }

  @HostListener('window:resize')
  onresize(){
    this.resize()
  }

}
