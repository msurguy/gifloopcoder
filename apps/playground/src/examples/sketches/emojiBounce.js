function onGLC(glc) {
    glc.loop();
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    var emojis = ["😀", "😎", "🤩", "🥳", "🤖"],
        spacing = width / (emojis.length + 1);

    for (var i = 0; i < emojis.length; i++) {
        list.addText({
            x: spacing * (i + 1),
            y: [height / 2 + 20, height / 2 - 40],
            text: emojis[i],
            fontSize: [30, 54],
            phase: i / emojis.length
        });
    }
}
