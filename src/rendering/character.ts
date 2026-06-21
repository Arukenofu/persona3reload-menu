import {
  PerspectiveCamera, Scene, ShaderMaterial, TextureLoader,
  AnimationMixer, AnimationClip, LoopOnce, LoopRepeat,
  Vector2, Object3D, Mesh,
  type WebGLRenderer, type Texture
} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js'

import characterVertShader from '@/assets/shaders/character.vert.glsl?raw'
import characterFragShader from '@/assets/shaders/character.frag.glsl?raw'
import uiTextureUrl from '@/assets/textures/makoto_ui_texture.png'
import modelUrl from '@/assets/models/makoto.glb?url'

const MODEL_FOV_RAD = 0.8819848354896674

const modelPromise: Promise<GLTF> = fetch(modelUrl)
  .then(r => r.arrayBuffer())
  .then(buf => new Promise<GLTF>((resolve, reject) =>
    new GLTFLoader().parse(buf, '', resolve, reject)
  ))

export interface CharacterController {
  update(delta: number): void
  render(renderer: WebGLRenderer): void
  playEntrance(): void
  resize(width: number, height: number): void
  dispose(): void
}

export async function createCharacter(
  backgroundTexture: Texture,
  width: number,
  height: number
): Promise<CharacterController> {
  const camera = new PerspectiveCamera(
    MODEL_FOV_RAD * (180 / Math.PI),
    width / height,
    0.1,
    1000
  )
  camera.position.set(0, 0, 0.71)

  const scene = new Scene()

  const uiTexture = new TextureLoader().load(uiTextureUrl)
  uiTexture.flipY = false

  const material = new ShaderMaterial({
    vertexShader: characterVertShader,
    fragmentShader: characterFragShader,
    uniforms: {
      uAlbedo: { value: uiTexture },
      uBackground: { value: backgroundTexture },
      uResolution: { value: new Vector2(width, height) },
      uFresnelThickness: { value: 12.0 },
    },
    transparent: true,
  })

  const gltf = await modelPromise
  const model = gltf.scene

  model.position.set(-0.1, 0, -0.02)
  model.rotation.y = 0.268

  model.traverse((child: Object3D) => {
    if (child instanceof Mesh) {
      child.material = material
    }
  })

  scene.add(model)

  const mixer = new AnimationMixer(model)

  let fallClip: AnimationClip | undefined
  let swingClip: AnimationClip | undefined

  for (const clip of gltf.animations) {
    if (clip.name === 'UI_MAIN_fall') fallClip = clip
    if (clip.name === 'UI_MAIN_swing-loop') swingClip = clip
  }

  return {
    update(delta: number) {
      mixer.update(delta)
    },

    render(renderer: WebGLRenderer) {
      renderer.clearDepth()
      renderer.render(scene, camera)
    },

    playEntrance() {
      if (!fallClip) return

      const fallAction = mixer.clipAction(fallClip)
      fallAction.setLoop(LoopOnce, 1)
      fallAction.clampWhenFinished = true
      fallAction.timeScale = 0.75
      fallAction.play()

      if (swingClip) {
        const clip = swingClip
        setTimeout(() => {
          const swingAction = mixer.clipAction(clip)
          swingAction.setLoop(LoopRepeat, Infinity)
          fallAction.crossFadeTo(swingAction, 0.5, true)
          swingAction.play()
        }, 600)
      }
    },

    resize(width: number, height: number) {
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      material.uniforms.uResolution.value.set(width, height)
    },

    dispose() {
      material.dispose()
    },
  }
}
