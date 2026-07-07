function onGLC(glc) {
    glc.loop();
    glc.styles.backgroundColor = "#f5f0e6";
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    // Bold comic shapes: a pulsing sun over rolling hills.
    list.addCircle({
        x: width * 0.5,
        y: height * 0.42,
        radius: [70, 110],
        fillStyle: "#222222"
    });

    list.addStar({
        x: width * 0.5,
        y: height * 0.42,
        points: 12,
        innerRadius: [90, 120],
        outerRadius: [120, 160],
        rotation: [0, 30],
        fill: false,
        stroke: true,
        lineWidth: 6,
        strokeStyle: "#222222"
    });

    list.addOval({
        x: width * 0.25,
        y: height * 0.95,
        rx: width * 0.45,
        ry: [90, 110],
        fillStyle: "#555555"
    });
    list.addOval({
        x: width * 0.8,
        y: height,
        rx: width * 0.5,
        ry: [120, 100],
        fillStyle: "#333333"
    });

    // The newspaper-repro look lives in the effects block below — tweak the
    // halftone via the Effects panel.
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
  glc.effects.add("colorMatrix", { preset: "blackAndWhite" });
  glc.effects.add("dot", { scale: 0.9, angle: [4.8, 5.2] });
}
// ─ end managed block ─
