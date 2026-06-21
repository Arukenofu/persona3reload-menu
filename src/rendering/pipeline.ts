import {
  Scene, Mesh, ShaderMaterial, WebGLRenderTarget,
  LinearFilter, TextureLoader, RepeatWrapping, Vector2,
  type WebGLRenderer, type OrthographicCamera, type PlaneGeometry
} from 'three'

import vertexShader from '@/assets/shaders/fullscreen.vert.glsl?raw'
import noiseGLSL from '@/assets/shaders/noise.glsl?raw'
import baseFragRaw from '@/assets/shaders/base.frag.glsl?raw'
import compositeFragRaw from '@/assets/shaders/composite.frag.glsl?raw'
import blurFragShader from '@/assets/shaders/blur.frag.glsl?raw'
import finalFragShader from '@/assets/shaders/final.frag.glsl?raw'
import caustic1Url from '@/assets/textures/caustic_1_mask.png'
import caustic2Url from '@/assets/textures/caustic_2_mask.png'

const baseFragShader = baseFragRaw.replace('#include <noise>', noiseGLSL)
const compositeFragShader = compositeFragRaw.replace('#include <noise>', noiseGLSL)

export interface RenderPipeline {
  readonly finalTarget: WebGLRenderTarget
  render(time: number): void
  renderToScreen(whiteEnabled: boolean): void
  resize(width: number, height: number, scale: number): void
  dispose(): void
}

export function createPipeline(
  renderer: WebGLRenderer,
  camera: OrthographicCamera,
  geometry: PlaneGeometry,
  width: number,
  height: number,
  scale: number
): RenderPipeline {
  const rw = Math.floor(width * scale)
  const rh = Math.floor(height * scale)

  const loader = new TextureLoader()
  const causticMask1 = loader.load(caustic1Url)
  const causticMask2 = loader.load(caustic2Url)
  causticMask1.wrapS = causticMask1.wrapT = RepeatWrapping
  causticMask2.wrapS = causticMask2.wrapT = RepeatWrapping

  const filterOpts = { minFilter: LinearFilter, magFilter: LinearFilter }
  const rtBase = new WebGLRenderTarget(rw, rh, filterOpts)
  const rtComposite = new WebGLRenderTarget(rw, rh, filterOpts)
  const rtBlur = new WebGLRenderTarget(rw, rh, filterOpts)
  const rtFinal = new WebGLRenderTarget(width, height, filterOpts)

  const sceneBase = new Scene()
  const matBase = new ShaderMaterial({
    vertexShader,
    fragmentShader: baseFragShader,
    uniforms: { uTime: { value: 0 } },
  })
  sceneBase.add(new Mesh(geometry, matBase))

  const sceneComposite = new Scene()
  const matComposite = new ShaderMaterial({
    vertexShader,
    fragmentShader: compositeFragShader,
    uniforms: {
      uTime: { value: 0 },
      uBase: { value: rtBase.texture },
      uCausticMask1: { value: causticMask1 },
      uCausticMask2: { value: causticMask2 },
      uResolution: { value: new Vector2(rw, rh) },
    },
  })
  sceneComposite.add(new Mesh(geometry, matComposite))

  const sceneBlur = new Scene()
  const matBlur = new ShaderMaterial({
    vertexShader,
    fragmentShader: blurFragShader,
    uniforms: {
      uTexture: { value: rtComposite.texture },
      uPixelSize: { value: new Vector2(1 / rw, 1 / rh) },
    },
  })
  sceneBlur.add(new Mesh(geometry, matBlur))

  const sceneFinal = new Scene()
  const matFinal = new ShaderMaterial({
    vertexShader,
    fragmentShader: finalFragShader,
    uniforms: {
      uTexture: { value: rtBlur.texture },
      uShowWhite: { value: 0 },
    },
  })
  sceneFinal.add(new Mesh(geometry, matFinal))

  return {
    finalTarget: rtFinal,

    render(time: number) {
      matBase.uniforms.uTime.value = time
      matComposite.uniforms.uTime.value = time

      renderer.setRenderTarget(rtBase)
      renderer.clear()
      renderer.render(sceneBase, camera)

      renderer.setRenderTarget(rtComposite)
      renderer.clear()
      renderer.render(sceneComposite, camera)

      renderer.setRenderTarget(rtBlur)
      renderer.clear()
      renderer.render(sceneBlur, camera)

      matFinal.uniforms.uShowWhite.value = 0
      renderer.setRenderTarget(rtFinal)
      renderer.clear()
      renderer.render(sceneFinal, camera)
    },

    renderToScreen(whiteEnabled: boolean) {
      matFinal.uniforms.uShowWhite.value = whiteEnabled ? 1 : 0
      renderer.setRenderTarget(null)
      renderer.clear()
      renderer.render(sceneFinal, camera)
    },

    resize(width: number, height: number, scale: number) {
      const nrw = Math.floor(width * scale)
      const nrh = Math.floor(height * scale)
      rtBase.setSize(nrw, nrh)
      rtComposite.setSize(nrw, nrh)
      rtBlur.setSize(nrw, nrh)
      rtFinal.setSize(width, height)
      matComposite.uniforms.uResolution.value.set(nrw, nrh)
      matBlur.uniforms.uPixelSize.value.set(1 / nrw, 1 / nrh)
    },

    dispose() {
      rtBase.dispose()
      rtComposite.dispose()
      rtBlur.dispose()
      rtFinal.dispose()
      matBase.dispose()
      matComposite.dispose()
      matBlur.dispose()
      matFinal.dispose()
    },
  }
}
