/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { CameraFrame as EngineCameraFrame, Color, Script } from "playcanvas";

/*

    https://github.com/playcanvas/engine/blob/main/scripts/esm/camera-frame.mjs

    Implements post effects on a camera

*/

/** @enum {number} */
const ToneMapping = {
  LINEAR: 0, // TONEMAP_LINEAR
  FILMIC: 1, // TONEMAP_FILMIC
  HEJL: 2, // TONEMAP_HEJL
  ACES: 3, // TONEMAP_ACES
  ACES2: 4, // TONEMAP_ACES2
  NEUTRAL: 5, // TONEMAP_NEUTRAL
};

/** @enum {string} */
const SsaoType = {
  NONE: "none", // SSAOTYPE_NONE
  LIGHTING: "lighting", // SSAOTYPE_LIGHTING
  COMBINE: "combine", // SSAOTYPE_COMBINE
};

/** @enum {number} */
const RenderFormat = {
  RGBA8: 7, // PIXELFORMAT_RGBA8
  RG11B10: 18, // PIXELFORMAT_111110F
  RGBA16: 12, // PIXELFORMAT_RGBA16F
  RGBA32: 14, // PIXELFORMAT_RGBA32F
};

/** @enum {string} */
const DebugType: Record<string, EngineCameraFrame["debug"]> = {
  NONE: null,
  SCENE: "scene",
  SSAO: "ssao",
  BLOOM: "bloom",
  VIGNETTE: "vignette",
  DOFCOC: "dofcoc",
  DOFBLUR: "dofblur",
};

/** @interface */
class Rendering {
  /**
   * @attribute
   * @type {RenderFormat}
   */
  renderFormat = RenderFormat.RGBA32;

  /**
   * @attribute
   * @type {RenderFormat}
   */
  renderFormatFallback0 = RenderFormat.RGBA16;

  /**
   * @attribute
   * @type {RenderFormat}
   */
  renderFormatFallback1 = RenderFormat.RGBA32;

  stencil = false;

  /**
   * @attribute
   * @range [0.1, 1]
   * @precision 2
   * @step 0.01
   */
  renderTargetScale = 1.0;

  /**
   * @attribute
   * @range [1, 4]
   * @precision 0
   * @step 1
   */
  samples = 1;

  sceneColorMap = false;

  sceneDepthMap = false;

  /**
   * @attribute
   * @type {ToneMapping}
   */
  toneMapping = ToneMapping.LINEAR;

  /**
   * @range [0, 1]
   * @precision 3
   * @step 0.001
   */
  sharpness = 0.0;

  /**
   * @attribute
   * @type {DebugType}
   */
  debug = DebugType.NONE;
}

/** @interface */
class Ssao {
  /**
   * @attribute
   * @type {SsaoType}
   */
  type = SsaoType.NONE;

  /**
   * @visibleif {type !== 'none'}
   */
  blurEnabled = true;

  /**
   * @range [0, 1]
   * @visibleif {type !== 'none'}
   * @precision 3
   * @step 0.001
   */
  intensity = 0.5;

  /**
   * @range [0, 100]
   * @visibleif {type !== 'none'}
   * @precision 3
   * @step 0.001
   */
  radius = 30;

  /**
   * @range [1, 64]
   * @visibleif {type !== 'none'}
   * @precision 0
   * @step 1
   */
  samples = 12;

  /**
   * @range [0.1, 10]
   * @visibleif {type !== 'none'}
   * @precision 3
   * @step 0.001
   */
  power = 6;

  /**
   * @range [1, 90]
   * @visibleif {type !== 'none'}
   * @precision 1
   * @step 1
   */
  minAngle = 10;

  /**
   * @range [0.5, 1]
   * @visibleif {type !== 'none'}
   * @precision 3
   * @step 0.001
   */
  scale = 1;
}

/** @interface */
class Bloom {
  enabled = false;

  /**
   * @visibleif {enabled}
   * @range [0, 0.1]
   * @precision 3
   * @step 0.001
   */
  intensity = 0.01;

  /**
   * @attribute
   * @visibleif {enabled}
   * @range [0, 16]
   * @precision 0
   * @step 0
   */
  blurLevel = 16;
}

/** @interface */
class Grading {
  enabled = false;

  /**
   * @visibleif {enabled}
   * @range [0, 3]
   * @precision 3
   * @step 0.001
   */
  brightness = 1;

  /**
   * @visibleif {enabled}
   * @range [0.5, 1.5]
   * @precision 3
   * @step 0.001
   */
  contrast = 1;

  /**
   * @visibleif {enabled}
   * @range [0, 2]
   * @precision 3
   * @step 0.001
   */
  saturation = 1;

  /**
   * @attribute
   * @visibleif {enabled}
   */
  tint = new Color(1, 1, 1, 1);
}

/** @interface */
class Vignette {
  enabled = false;

  /**
   * @visibleif {enabled}
   * @range [0, 1]
   * @precision 3
   * @step 0.001
   */
  intensity = 0.5;

  /**
   * @visibleif {enabled}
   * @range [0, 3]
   * @precision 3
   * @step 0.001
   */
  inner = 0.5;

  /**
   * @visibleif {enabled}
   * @range [0, 3]
   * @precision 3
   * @step 0.001
   */
  outer = 1;

  /**
   * @visibleif {enabled}
   * @range [0.01, 10]
   * @precision 3
   * @step 0.001
   */
  curvature = 0.5;
}

/** @interface */
class Fringing {
  enabled = false;

  /**
   * @visibleif {enabled}
   * @range [0, 100]
   * @precision 1
   * @step 0.1
   */
  intensity = 50;
}

/** @interface */
class Taa {
  enabled = false;

  /**
   * @visibleif {enabled}
   * @range [0, 1]
   * @precision 2
   * @step 0.1
   */
  jitter = 1;
}

/** @interface */
class Dof {
  enabled = false;

  /**
   * @visibleif {enabled}
   */
  highQuality = true;

  /**
   * @visibleif {enabled}
   */
  nearBlur = false;

  /**
   * @visibleif {enabled}
   * @precision 2
   * @step 1
   */
  focusDistance = 100;

  /**
   * @visibleif {enabled}
   * @precision 2
   * @step 1
   */
  focusRange = 10;

  /**
   * @visibleif {enabled}
   * @precision 2
   * @step 0.1
   */
  blurRadius = 3;

  /**
   * @visibleif {enabled}
   * @range [1, 10]
   * @precision 0
   * @step 1
   */
  blurRings = 4;

  /**
   * @visibleif {enabled}
   * @range [1, 10]
   * @precision 0
   * @step 1
   */
  blurRingPoints = 5;
}

class CameraFrame extends Script {
  private className = "cameraFrame";

  /**
   * @attribute
   * @type {Rendering}
   */
  public rendering = new Rendering();

  /**
   * @attribute
   * @type {Ssao}
   */
  public ssao = new Ssao();

  /**
   * @attribute
   * @type {Bloom}
   */
  public bloom = new Bloom();

  /**
   * @attribute
   * @type {Grading}
   */
  public grading = new Grading();

  /**
   * @attribute
   * @type {Vignette}
   */
  public vignette = new Vignette();

  /**
   * @attribute
   * @type {Taa}
   */
  public taa = new Taa();

  /**
   * @attribute
   * @type {Fringing}
   */
  public fringing = new Fringing();

  /**
   * @attribute
   * @type {Dof}
   */
  private dof = new Dof();

  private engineCameraFrame!: EngineCameraFrame;

  initialize() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.engineCameraFrame = new EngineCameraFrame(this.app, this.entity.camera!);

    this.on("enable", () => {
      this.engineCameraFrame.enabled = true;
    });

    this.on("disable", () => {
      this.engineCameraFrame.enabled = false;
    });

    this.on("destroy", () => {
      this.engineCameraFrame.destroy();
    });

    this.on("state", (enabled) => {
      this.engineCameraFrame.enabled = enabled;
    });
  }

  postUpdate() {
    const cf = this.engineCameraFrame;
    const { rendering, bloom, grading, vignette, fringing, taa, ssao, dof } = this;

    const dstRendering = cf.rendering;
    dstRendering.renderFormats.length = 0;
    dstRendering.renderFormats.push(rendering.renderFormat);
    dstRendering.renderFormats.push(rendering.renderFormatFallback0);
    dstRendering.renderFormats.push(rendering.renderFormatFallback1);
    dstRendering.stencil = rendering.stencil;
    dstRendering.renderTargetScale = rendering.renderTargetScale;
    dstRendering.samples = rendering.samples;
    dstRendering.sceneColorMap = rendering.sceneColorMap;
    dstRendering.sceneDepthMap = rendering.sceneDepthMap;
    dstRendering.toneMapping = rendering.toneMapping;
    dstRendering.sharpness = rendering.sharpness;

    // ssao
    const dstSsao = cf.ssao;
    dstSsao.type = ssao.type;
    if (ssao.type !== SsaoType.NONE) {
      dstSsao.intensity = ssao.intensity;
      dstSsao.radius = ssao.radius;
      dstSsao.samples = ssao.samples;
      dstSsao.power = ssao.power;
      dstSsao.minAngle = ssao.minAngle;
      dstSsao.scale = ssao.scale;
    }

    // bloom
    const dstBloom = cf.bloom;
    dstBloom.intensity = bloom.enabled ? bloom.intensity : 0;
    if (bloom.enabled) {
      dstBloom.blurLevel = bloom.blurLevel;
    }

    // grading
    const dstGrading = cf.grading;
    dstGrading.enabled = grading.enabled;
    if (grading.enabled) {
      dstGrading.brightness = grading.brightness;
      dstGrading.contrast = grading.contrast;
      dstGrading.saturation = grading.saturation;
      dstGrading.tint.copy(grading.tint);
    }

    // vignette
    const dstVignette = cf.vignette;
    dstVignette.intensity = vignette.enabled ? vignette.intensity : 0;
    if (vignette.enabled) {
      dstVignette.inner = vignette.inner;
      dstVignette.outer = vignette.outer;
      dstVignette.curvature = vignette.curvature;
    }

    // taa
    const dstTaa = cf.taa;
    dstTaa.enabled = taa.enabled;
    if (taa.enabled) {
      dstTaa.jitter = taa.jitter;
    }

    // fringing
    const dstFringing = cf.fringing;
    dstFringing.intensity = fringing.enabled ? fringing.intensity : 0;

    // dof
    const dstDof = cf.dof;
    dstDof.enabled = dof.enabled;
    if (dof.enabled) {
      dstDof.highQuality = dof.highQuality;
      dstDof.nearBlur = dof.nearBlur;
      dstDof.focusDistance = dof.focusDistance;
      dstDof.focusRange = dof.focusRange;
      dstDof.blurRadius = dof.blurRadius;
      dstDof.blurRings = dof.blurRings;
      dstDof.blurRingPoints = dof.blurRingPoints;
    }

    // debugging
    cf.debug = rendering.debug;

    cf.update();
  }
}

export { CameraFrame };
