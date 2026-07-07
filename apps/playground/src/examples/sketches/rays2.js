function onGLC(glc) {
    var list = glc.renderList;

    glc.loop();
    glc.styles.backgroundColor = "#000000";

    
    // your code goes here:
    
    var num=100;
    
    for (var i=0; i<num; i++) {
        list.addRay({
            lineWidth: [1,3],
            strokeStyle: "rgba(255,255,255,.8)",
            x: [.3*glc.w,.4*glc.w],
            y: .1*glc.h + (glc.h*.7)/num*i,
            length: [i+glc.h*.4,glc.h*.2],
            angle: [10,30+.1*i],
            phase: 1.0/num*i*3
        });
    }


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
