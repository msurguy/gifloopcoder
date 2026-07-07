function onGLC(glc) {
    glc.loop();
    glc.styles.backgroundColor = "#101418";
    var list = glc.renderList,
        width = glc.w,
        height = glc.h,
        color = glc.color;

    // A broadcast test card: color bars sliding in a loop.
    var bars = ["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0"];
    for (var i = 0; i < bars.length; i++) {
        list.addRect({
            x: (i + 0.5) * width / bars.length,
            y: [height * 0.32, height * 0.38],
            w: width / bars.length,
            h: height * 0.55,
            phase: i * 0.07,
            fillStyle: bars[i]
        });
    }

    list.addText({
        x: width / 2,
        y: height * 0.78,
        text: "ON AIR",
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: [28, 36],
        fillStyle: color.animHSV(0, 60, 0.9, 0.9, 1, 1)
    });

    // The retro stack (CRT glass, film damage, channel misalignment) lives in
    // the effects block below — tweak it live via the Effects panel.
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
  glc.effects.add("rgbSplit", { redX: [-3, -1], redY: 0, greenX: 0, greenY: [1, 2], blueX: [2, 3], blueY: 0 });
  glc.effects.add("oldFilm", { sepia: 0.15, noise: 0.2, scratchDensity: 0.4, vignetting: 0.25 });
  glc.effects.add("crt", { curvature: 2, lineWidth: 1.5, lineContrast: 0.3, noise: 0.15 });
}
// ─ end managed block ─
