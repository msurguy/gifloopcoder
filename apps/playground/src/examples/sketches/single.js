function onGLC(glc) {
    glc.loop();
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;



    list.addLine({
        x0: -20,
        y0: -20,
        x1: [0, 80],
        y1: [40, 230]
    });

    list.addLine({
        x0: [-20, 200],
        y0: [-20, 20],
        x1: 80,
        y1: 230
    });

    list.addLine({
        x0: 200,
        y0: 20,
        x1: [80, 250],
        y1: [230, 200]
    });

    list.addLine({
        x0: [200, 300],
        y0: [20, 230],
        x1: 250,
        y1: 200
    });

    list.addLine({
        x0: 300,
        y0: 230,
        x1: [250, 350],
        y1: 200
    });

    list.addLine({
        x0: [300, 410],
        y0: [230, 20],
        x1: 350,
        y1: 200
    });

    list.addLine({
        x0: 410,
        y0: 20,
        x1: [350, 410],
        y1: 200
    })



}

// ─ Settings & effects: managed by the panels ─
// (edits below are overwritten by the panels)
function onGLCPanel(glc) {
  glc.size(400, 250);
  glc.setFPS(30);
  glc.setDuration(1);
  glc.setMode("single");
  glc.setEasing(true);
  glc.setMaxColors(256);
}
// ─ end managed block ─
