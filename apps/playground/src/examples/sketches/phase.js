function onGLC(glc) {
    glc.loop();
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    var phase = 0;

    for(var x = 20; x < 600; x += 20 ) {
        list.addRect({
            x: x,
            y: [50, 150],
            w: 50,
            h: 50,
            stroke: true,
            fillStyle: "white",
            rotation: [0, 180],
            phase: phase += 0.01
        })
    }


}

// ─ Settings & effects: managed by the panels ─
// (edits below are overwritten by the panels)
function onGLCPanel(glc) {
  glc.size(600, 200);
  glc.setFPS(30);
  glc.setDuration(2);
  glc.setMode("bounce");
  glc.setEasing(true);
  glc.setMaxColors(256);
}
// ─ end managed block ─
