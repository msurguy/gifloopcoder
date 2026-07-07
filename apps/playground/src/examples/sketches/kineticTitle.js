function onGLC(glc) {
    glc.loop();
    glc.styles.backgroundColor = "#111";
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    list.addText({
        x: width / 2,
        y: height / 2,
        text: "LOOP FOREVER",
        fontWeight: "bold",
        fontFamily: "sans-serif",
        fontSize: [34, 42],
        letterSpacing: [0, 4],
        rotation: [-6, 6],
        fillStyle: glc.color.animHSV(280, 40, 0.8, 0.8, 1, 1)
    });
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
}
// ─ end managed block ─
