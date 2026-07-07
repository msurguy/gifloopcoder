function onGLC(glc) {
    glc.loop();
    glc.styles.backgroundColor = "#101014";
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    // A wheel of colored orbs (static scene; the effects do the animating).
    var n = 8;
    for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2;
        list.addCircle({
            x: width / 2 + Math.cos(a) * width * 0.3,
            y: height / 2 + Math.sin(a) * height * 0.3,
            radius: 34,
            fillStyle: "hsl(" + (i * 360 / n) + ", 80%, 55%)"
        });
    }
    list.addCircle({
        x: width / 2,
        y: height / 2,
        radius: 50,
        fillStyle: "#e8e8e8"
    });

    // The grade lives in the effects block below. A full 360° hue spin per
    // loop wraps seamlessly (single mode, no easing).
}

// ─ Settings & effects: managed by the panels ─
// (edits below are overwritten by the panels)
function onGLCPanel(glc) {
  glc.size(400, 400);
  glc.setFPS(30);
  glc.setDuration(4);
  glc.setMode("single");
  glc.setEasing(false);
  glc.setMaxColors(256);
  glc.effects.add("hslAdjustment", { hue: [0, 360] });
  glc.effects.add("colorMatrix", { preset: "vintage", amount: 0.6 });
  glc.effects.add("vignette", { amount: 0.4 });
}
// ─ end managed block ─
