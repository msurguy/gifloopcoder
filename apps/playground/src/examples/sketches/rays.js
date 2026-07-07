function onGLC(glc) {
    glc.loop();
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    // your code goes here:

    for(var a = 0; a < 360; a += 30) {
        list.addRay({
            x: width / 2,
            y: height / 2,
            angle: a,
            length: [0, glc.w / 2],
            phase: a / 360
        })
    }

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
