function onGLC(glc) {
    glc.loop();
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;


    var list = glc.renderList;

    for(var i = 0; i < 10; i++) {
        list.addBezierSegment({
            x0: 20,
            y0: 30,
            x1: 300,
            y1: 400,
            x2: 200,
            y2: 40,
            x3: 380,
            y3: 30,
            lineWidth: 40 - i * 7.5,
            percent: i * 0.2
        });
    }

}

// ─ Settings & effects: managed by the panels ─
// (edits below are overwritten by the panels)
function onGLCPanel(glc) {
  glc.size(400, 250);
  glc.setFPS(30);
  glc.setDuration(5);
  glc.setMode("bounce");
  glc.setEasing(true);
  glc.setMaxColors(256);
}
// ─ end managed block ─
