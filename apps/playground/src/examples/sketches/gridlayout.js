function onGLC(glc) {
    glc.loop();
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;


    var even = true,
        size = 50;

    for(var y = 0; y < height; y += size) {
        for(var x = 0; x < width; x += size) {
            list.addRect({
                translationX: x,
                translationY: y,
                x: size / 2,
                y: size / 2,
                w: even ? [size, size / 2] : [size / 2, size],
                h: even ? [size / 2, size] : [size, size / 2]
            });
            even = !even;
        }
        even = !even;
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
