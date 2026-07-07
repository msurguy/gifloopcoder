function onGLC(glc) {
    glc.loop();
    glc.styles.backgroundColor = "#04263a";
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    // A little fish drifting across, bubbles rising.
    list.addOval({
        x: [width * 0.25, width * 0.65],
        y: [height * 0.3, height * 0.36],
        rx: 34,
        ry: 18,
        fillStyle: "#ff9d47"
    });
    list.addPoly({
        x: [width * 0.25 - 34, width * 0.65 - 34],
        y: [height * 0.3, height * 0.36],
        radius: 16,
        sides: 3,
        rotation: 180,
        fillStyle: "#ffb066"
    });

    for (var i = 0; i < 6; i++) {
        list.addCircle({
            x: width * (0.15 + i * 0.14),
            y: [height * 0.85, height * 0.15],
            radius: 4 + (i % 3) * 3,
            phase: i * 0.17,
            stroke: true,
            fill: false,
            lineWidth: 2,
            strokeStyle: "rgba(255,255,255,0.7)"
        });
    }

    list.addRect({
        x: width / 2,
        y: height * 0.94,
        w: width,
        h: height * 0.16,
        fillStyle: "#0a3a24"
    });

    // Sunbeams, wavy water, and the blue grade live in the effects block
    // below — tweak them live via the Effects panel.
}

// ─ Settings & effects: managed by the panels ─
// (edits below are overwritten by the panels)
function onGLCPanel(glc) {
  glc.size(400, 400);
  glc.setFPS(30);
  glc.setDuration(3);
  glc.setMode("bounce");
  glc.setEasing(true);
  glc.setMaxColors(256);
  glc.effects.add("godray", { angle: 25, gain: 0.55, lacunarity: 2.8, alpha: 0.5, time: [0, 4] });
  glc.effects.add("reflection", { boundary: 0.72, amplitudeStart: 2, amplitudeEnd: 14, alphaEnd: 0.8 });
  glc.effects.add("adjustment", { blue: 1.25, green: 1.05, red: 0.8, saturation: 1.1 });
}
// ─ end managed block ─
