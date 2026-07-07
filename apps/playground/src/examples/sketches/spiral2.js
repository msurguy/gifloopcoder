function onGLC(glc) {
    var list = glc.renderList;

    glc.loop();
    
    list.addSpiral({
        x: glc.w/2,
        y: glc.h/2,
        innerRadius: [5,100],
        outerRadius: 150,
        turns: [5,12],
        res: 1,
        rotation: [0,360],
        stroke: true,
        fill: true,
        strokeWidth:[2,10],
        strokeStyle: "white",
        fillStyle: "black"
    });



}

// ─ Settings & effects: managed by the panels ─
// (edits below are overwritten by the panels)
function onGLCPanel(glc) {
  glc.size(540, 540);
  glc.setFPS(30);
  glc.setDuration(3);
  glc.setMode("bounce");
  glc.setEasing(true);
  glc.setMaxColors(256);
}
// ─ end managed block ─
