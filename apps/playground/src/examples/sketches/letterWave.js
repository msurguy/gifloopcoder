function onGLC(glc) {
    glc.loop();
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    var word = "WAVY",
        fontSize = 60,
        letterWidth = fontSize * 0.75,
        startX = width / 2 - (word.length - 1) * letterWidth / 2;

    for (var i = 0; i < word.length; i++) {
        list.addText({
            x: startX + i * letterWidth,
            y: [height / 2 + 30, height / 2 - 30],
            text: word[i],
            fontSize: fontSize,
            fontWeight: "bold",
            textAlign: "center",
            fillStyle: glc.color.animHSV(0, 360, 0.7, 0.7, 0.95, 0.95),
            phase: i / word.length
        });
    }
}
