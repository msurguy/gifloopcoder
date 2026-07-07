// 5x4 color-matrix filter with the classic PixiJS presets. Matrices ported from
// pixijs (MIT): reference/pixijs-dev/src/filters/defaults/color-matrix.
// Layout: 4 rows (R,G,B,A) x 5 columns (r,g,b,a,offset) = 20 floats.

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

const IDENTITY: readonly number[] = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

export const colorMatrixPresets: Record<string, readonly number[]> = {
  none: IDENTITY,
  blackAndWhite: [
    0.3, 0.6, 0.1, 0, 0,
    0.3, 0.6, 0.1, 0, 0,
    0.3, 0.6, 0.1, 0, 0,
    0, 0, 0, 1, 0,
  ],
  negative: [
    -1, 0, 0, 1, 0,
    0, -1, 0, 1, 0,
    0, 0, -1, 1, 0,
    0, 0, 0, 1, 0,
  ],
  sepia: [
    0.393, 0.7689999, 0.18899999, 0, 0,
    0.349, 0.6859999, 0.16799999, 0, 0,
    0.272, 0.5339999, 0.13099999, 0, 0,
    0, 0, 0, 1, 0,
  ],
  technicolor: [
    1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0, 0.046249425232852304,
    -0.3087833385928097, 1.7658908555458428, -0.10601743074722245, 0, -0.2758903984886823,
    -0.231103377548616, -0.7501899197440212, 1.847597816108189, 0, 0.12137623870388682,
    0, 0, 0, 1, 0,
  ],
  polaroid: [
    1.438, -0.062, -0.062, 0, 0,
    -0.122, 1.378, -0.122, 0, 0,
    -0.016, -0.016, 1.483, 0, 0,
    0, 0, 0, 1, 0,
  ],
  kodachrome: [
    1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0, 0.24991995145868634,
    -0.16404339962244616, 1.0835251566291304, -0.05498805115633132, 0, 0.09698983488904393,
    -0.16786010706155763, -0.5603416277695248, 1.6014850761964943, 0, 0.13972481597886063,
    0, 0, 0, 1, 0,
  ],
  browni: [
    0.5997023498159715, 0.34553243048391263, -0.2708298674538042, 0, 0.1860075629647401,
    -0.037703249837783157, 0.8609577587992641, 0.15059552388459913, 0, -0.14497417640467167,
    0.24113635128153335, -0.07441037908422492, 0.44972182064877153, 0, -0.029655197167024642,
    0, 0, 0, 1, 0,
  ],
  vintage: [
    0.6279345635605994, 0.3202183420819367, -0.03965408211312453, 0, 0.037848179746251466,
    0.02578397704808868, 0.6441188644374771, 0.03259127616149294, 0, 0.029265996770472907,
    0.0466055556782719, -0.0851232987247891, 0.5241648018700465, 0, 0.020232119953863904,
    0, 0, 0, 1, 0,
  ],
  lsd: [
    2, -0.4, 0.5, 0, 0,
    -0.5, 2, -0.4, 0, 0,
    -0.4, -0.5, 3, 0, 0,
    0, 0, 0, 1, 0,
  ],
  predator: [
    11.224130630493164, -4.794486999511719, -2.8746118545532227, 0, 0.40342438220977783,
    -3.6330697536468506, 9.193157196044922, -2.951810836791992, 0, -1.316135048866272,
    -3.2184197902679443, -4.2375030517578125, 7.476448059082031, 0, 0.8044459223747253,
    0, 0, 0, 1, 0,
  ],
};

export type ColorMatrixPreset = keyof typeof colorMatrixPresets;

export interface ColorMatrixOptions {
  /** Named preset (see colorMatrixPresets). Ignored when `matrix` is given. Default 'sepia'. */
  preset?: string;
  /** Custom 20-float matrix (4 rows x [r,g,b,a,offset]). */
  matrix?: readonly number[];
  /** Blend between identity (0) and the full matrix (1). Animatable. Default 1. */
  amount?: ScalarParam;
}

export function colorMatrix(gl: WebGL2RenderingContext, options: ColorMatrixOptions = {}): Pass {
  const target = options.matrix ?? colorMatrixPresets[options.preset ?? 'sepia'] ?? IDENTITY;

  // Lerp the whole matrix toward identity by amount, per frame (animatable).
  const evalMatrix = (t: number): number[] => {
    const amount = resolveScalar(options.amount, t, 1);
    const out = new Array<number>(20);
    for (let i = 0; i < 20; i++) {
      out[i] = IDENTITY[i] + (target[i] - IDENTITY[i]) * amount;
    }
    return out;
  };

  return new ShaderPass(
    gl,
    `
      vec4 c = texture(uTexture, vUv);
      fragColor = vec4(
        uMatrix[0] * c.r + uMatrix[1] * c.g + uMatrix[2] * c.b + uMatrix[3] * c.a + uMatrix[4],
        uMatrix[5] * c.r + uMatrix[6] * c.g + uMatrix[7] * c.b + uMatrix[8] * c.a + uMatrix[9],
        uMatrix[10] * c.r + uMatrix[11] * c.g + uMatrix[12] * c.b + uMatrix[13] * c.a + uMatrix[14],
        uMatrix[15] * c.r + uMatrix[16] * c.g + uMatrix[17] * c.b + uMatrix[18] * c.a + uMatrix[19]
      );
    `,
    { uMatrix: evalMatrix },
    'uniform float uMatrix[20];'
  );
}
