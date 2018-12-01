'use strict'

class App {

	constructor(shape = 'cube') {

		// set properties
		this.mouse = { x: 0, y: 0 }
		this.animation = {
			sphere: {
				thetaLength: 0.05,
				phiLength: 0.05
			},
			cone: {
				radialSegments: 1,
				thetaLength: 0.05
			},
			cylinder: {
				radiusTop: 0.3,
				radiusBottom: 0.3,
				radialSegments: 1,
				thetaLength: 0.05
			},
			torus: {
				arc: 0.05
			},
			cube: {
				width: 0.3,
				height: 0.3,
				depth: 0.3
			}
		}

		// init
		this.init()

		// init shape
		this.initShape(shape)

		// render scene
		this.renderer.render(this.scene, this.camera)

	}

	init() {

		// skip if there's no THREE
		if (!THREE) return

		// set scene and camera
		this.scene = new THREE.Scene()
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000)
		// this.camera.position.z = 500

		// set renderer
		this.renderer = new THREE.WebGLRenderer()
		this.renderer.setSize( window.innerWidth, window.innerHeight )
		document.body.appendChild(this.renderer.domElement)

		// set events
		window.addEventListener('resize', this.resize.bind(this))
		window.addEventListener('mousemove', this.mouseMove.bind(this))
		window.addEventListener('mousewheel', this.scroll.bind(this), { passive: true })

		// resize and render
		this.resize()

	}

	initShape(shape) {

		switch(shape) {
			case 'sphere':
				this.geometry = new THREE.SphereGeometry(32, 32, 32, 0, Math.PI * 2, 0, Math.PI)
				break
			case 'cone':
				this.geometry = new THREE.ConeGeometry(32, 64, 32, 1, false, 0, Math.PI * 2)
				break
			case 'cylinder':
				this.geometry = new THREE.CylinderGeometry(10, 40, 64, 64, 1, false, 0, Math.PI * 2)
				break
			case 'torus':
				this.geometry = new THREE.TorusGeometry(12, 3, 21, 24, Math.PI * 2)
				break
			case 'cube':
			default:
				this.geometry = new THREE.BoxGeometry(32, 32, 32)
				break
		}

		this.material = new THREE.MeshNormalMaterial()

		this.shape = new THREE.Mesh(this.geometry, this.material)

		this.scene.add(this.shape)
		this.camera.position.z = 100

	}

	animate() {

		let params = this.shape.geometry.parameters,
			rotation = this.shape.rotation

		switch(this.geometry.type) {
			case 'SphereGeometry':
				this.animateSphere(params, rotation)
				break
			case 'ConeGeometry':
				this.animateCone(params, rotation)
				break
			case 'CylinderGeometry':
				this.animateCylinder(params, rotation)
				break
			case 'TorusGeometry':
				this.animateTorus(params, rotation)
				break
			case 'BoxGeometry':
				this.animateCube(params, rotation)
				break
		}

		this.shape.rotation.x = rotation.x + 0.025
		this.shape.rotation.y = rotation.y + 0.025
		this.shape.rotation.z = rotation.z + 0.025

	}

	animateSphere(params, rotation) {

		params = this.updateParameter('thetaLength', params, 'sphere', 0.01, Math.PI * 2, 'alternate')
		params = this.updateParameter('phiLength', params, 'sphere', 0.01, Math.PI * 2, 'alternate')

		this.shape.geometry.dispose()

		this.shape.geometry = new THREE.SphereGeometry(
			params.radius, params.widthSegments, params.heightSegments, 
			params.phiStart, params.phiLength, params.thetaStart, params.thetaLength
		)

	}

	animateCone(params, rotation) {

		// params = this.updateParameter('radialSegments', params, 'cone', 3, 64, 'alternate')
		params = this.updateParameter('thetaLength', params, 'cone', 0.1, Math.PI * 2, 'alternate')

		this.shape.geometry.dispose()

		this.shape.geometry = new THREE.ConeGeometry(
			params.radius, params.height, params.radialSegments, params.heightSegments,
			params.openEnded, params.thetaStart, params.thetaLength
		)

	}

	animateCylinder(params, rotation) {

		// params = this.updateParameter('radiusTop', params, 'cylinder', 10, 40, 'alternate')
		params = this.updateParameter('radiusBottom', params, 'cylinder', 10, 40, 'alternate')
		// params = this.updateParameter('thetaLength', params, 'cylinder', 0.1, Math.PI * 2, 'alternate')

		this.shape.geometry.dispose()

		this.shape.geometry = new THREE.CylinderGeometry(
			params.radiusTop, params.radiusBottom, params.height, params.radialSegments, 
			params.heightSegments, params.openEnded, params.thetaStart, params.thetaLength
		)

	}

	animateTorus(params, rotation) {

		const self = this

		// flip shape, doesn't seem to work tho
		const onComplete = function(param, params) {

			var mS = (new THREE.Matrix4()).identity()

			mS.elements[0] = -1
			mS.elements[5] = -1
			mS.elements[10] = -1

			self.shape.geometry.applyMatrix(mS)
		}

		params = this.updateParameter('arc', params, 'torus', 0.1, Math.PI * 2, 'alternate', 'linear', onComplete)

		this.shape.geometry.dispose()

		this.shape.geometry = new THREE.TorusGeometry(
			params.radius, params.tube, params.radialSegments,
			params.tubularSegments, params.arc
		)

	}

	animateCube(params, rotation) {

		params = this.updateParameter('width', params, 'cube', 10, 40, 'alternate', 'lineaer')
		params = this.updateParameter('height', params, 'cube', 10, 40, 'alternate', 'linear')
		params = this.updateParameter('depth', params, 'cube', 10, 40, 'alternate', 'linear')

		this.shape.geometry.dispose()

		this.shape.geometry = new THREE.BoxGeometry(
			params.width, params.height, params.depth
		)

	}

	updateParameter(param, parameters, shape, min, max, direction = 'normal', ease, onComplete) {

		parameters[param] += this.animation[shape][param]

		if (parameters[param] < min) {
			parameters[param] = min
			this.animation[shape][param] = 0 - this.animation[shape][param]
		}

		if (parameters[param] > max) {

			switch(direction) {
				case 'alternate':
					parameters[param] = max
					this.animation[shape][param] = 0 - this.animation[shape][param]
					break
				case 'normal':
					parameters[param] = min
					this.animation[shape][param] = 0 - this.animation[shape][param]
					break
			}

			if (onComplete && typeof onComplete === 'function') {
				onComplete(param, parameters)
			}
			
		}

		return parameters

	}

	setCamera(x, y, z) {

		// set new positions
		this.camera.position.x += (this.mouse.x - this.camera.position.x) * 0.05
        this.camera.position.y += (-this.mouse.y - this.camera.position.y) * 0.05

        // update camera
        this.camera.lookAt(this.scene.position)

	}

	scroll(e) {

		// get new camera position
		const z = this.camera.position.z - e.deltaY

		// apply position if it's above threshold
		this.camera.position.z = (z > 0) ? z : 0

	}

	mouseMove(e) {

		this.mouse.x = e.clientX - (this.width / 2)
		this.mouse.y = e.clientY - (this.height / 2)

	}

	resize() {

		// set canvas dimensions
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		// set renderer dimensions
		this.renderer.setSize(this.width, this.height)

		// set camera
		this.camera.aspect = this.width / this.height
		this.camera.updateProjectionMatrix()

		// render
		this.render()

	}

	render() {

		// add self to the requestAnimationFrame
		window.requestAnimationFrame(this.render.bind(this))

		// set camera positions
		this.setCamera()

		if (!this.shape) return

		// animate shape
		this.animate()

		// render
  		this.renderer.render(this.scene, this.camera);

	}

}