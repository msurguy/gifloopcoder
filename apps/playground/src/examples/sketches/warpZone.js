function onGLC(glc) {
    glc.loop();
    glc.styles.backgroundColor = "#0b0714";
    var list = glc.renderList,
        width = glc.w,
        height = glc.h,
        color = glc.color;

    // Concentric rings + a star to warp.
    for (var i = 0; i < 5; i++) {
        list.addCircle({
            x: width / 2,
            y: height / 2,
            radius: [30 + i * 34, 50 + i * 34],
            phase: i * 0.1,
            stroke: true,
            fill: false,
            lineWidth: 5,
            strokeStyle: color.animHSV(200 + i * 30, 260 + i * 30, 0.9, 0.9, 1, 1)
        });
    }

    list.addStar({
        x: width / 2,
        y: height / 2,
        points: 5,
        innerRadius: [12, 26],
        outerRadius: [30, 60],
        rotation: [0, 144],
        fillStyle: "#ffd75e"
    });

    // The warp stack lives in the effects block below, all animated over the
    // loop: twist winds up, zoom blur breathes, a shockwave rolls out.
}

// ─ Settings & effects: managed by the panels ─
// (edits below are overwritten by the panels)
function onGLCPanel(glc) {
  glc.size(400, 400);
  glc.setFPS(30);
  glc.setDuration(2.5);
  glc.setMode("bounce");
  glc.setEasing(true);
  glc.setMaxColors(256);
  glc.effects.add("twist", { radius: 260, angle: [0, 3.5] });
  glc.effects.add("zoomBlur", { strength: [0.02, 0.14] });
  glc.effects.add("shockwave", { amplitude: 40, wavelength: 140, speed: 380 });
}
// ─ end managed block ─
