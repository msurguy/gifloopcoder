function onGLC(glc) {
    glc.loop();
    glc.styles.backgroundColor = "#05030a";
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    // A neon skyline of flickering towers.
    var colors = ["#ff2d95", "#00e5ff", "#ffe14d", "#9d4dff"];
    for (var i = 0; i < 9; i++) {
        var w = width / 11;
        list.addRect({
            x: (i + 1) * width / 10,
            y: height - ([40, 90][i % 2] + i * 12) / 2,
            w: w,
            h: [40 + i * 12, 90 + i * 12],
            phase: i * 0.11,
            fillStyle: colors[i % colors.length]
        });
    }

    list.addText({
        x: width / 2,
        y: height * 0.3,
        text: "SIGNAL LOST",
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: 30,
        fillStyle: "#ffffff"
    });

    // The glitch stack lives in the effects block below — deterministic bands
    // jump 8 times per loop. Tweak it live via the Effects panel.
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
  glc.effects.add("glitch", { slices: 12, offset: [0.02, 0.08], density: 0.7, rgbOffset: 4 });
  glc.effects.add("rgbSplit", { redX: -4, greenY: 0, blueX: 4 });
  glc.effects.add("filmGrain", { amount: 0.12 });
}
// ─ end managed block ─
