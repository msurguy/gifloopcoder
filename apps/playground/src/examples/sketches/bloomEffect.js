function onGLC(glc) {
    glc.loop();
    glc.styles.backgroundColor = "#05060a";
    var list = glc.renderList,
        width = glc.w,
        height = glc.h,
        color = glc.color;

    // A bright ring on a near-black background — perfect fuel for bloom.
    list.addCircle({
        x: width / 2,
        y: height / 2,
        radius: [60, 150],
        stroke: true,
        fill: false,
        lineWidth: [12, 3],
        strokeStyle: color.animHSV(180, 320, 1, 1, 1, 1)
    });

    list.addStar({
        x: width / 2,
        y: height / 2,
        points: 6,
        innerRadius: [10, 30],
        outerRadius: [30, 80],
        rotation: [0, 120],
        fillStyle: "#fff2a8"
    });

    // The post-processing chain lives in the effects block below and shows up
    // in the Effects panel: bloom, an aberration that grows over the loop
    // (the [0, 6] tuple lerps with t — a function(t) works too in code), and
    // a custom GLSL scanline pass. `uTexture`, `vUv`, `uResolution` and
    // `uTime` are always in scope for custom shaders.
}

// ─ Settings & effects: managed by the panels ─
// (edits below are overwritten by the panels)
function onGLCPanel(glc) {
  glc.size(400, 400);
  glc.setFPS(30);
  glc.setDuration(2);
  glc.setMode("bounce");
  glc.setEasing(true);
  glc.setMaxColors(256);
  glc.effects.add("bloom", { strength: 0.9, threshold: 0.5, radius: 4 });
  glc.effects.add("chromaticAberration", { amount: [0, 6] });
  glc.effects.addShader({ fragment: "vec4 c = texture(uTexture, vUv);\nfloat scan = 0.9 + 0.1 * sin(vUv.y * uResolution.y * 1.5);\nfragColor = vec4(c.rgb * scan, c.a);" });
}
// ─ end managed block ─
