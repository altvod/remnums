var memmlib = memmlib || {};


memmlib.dialogShown = false;
memmlib.showSimpleDialog = function(html, position) {
    if (memmlib.dialogShown) {
        return;
    }
    position = position || {};
    var body = document.getElementsByTagName('body').item(0);
    var shadowDiv = document.createElement("DIV");
    shadowDiv.setAttribute('class', 'dialog-shadow');
    body.appendChild(shadowDiv);

    var dialogPlacer = memmlib.generateTable(3, 3);
    dialogPlacer.setAttribute('class', 'dialog-placement-table');
    body.appendChild(dialogPlacer);

    var topLeftCell = memmlib.getTableCell('.dialog-placement-table', 1, 1);
    if (position.x != undefined) {
        topLeftCell.style.width = position.x + 'px';
    }
    if (position.y != undefined) {
        topLeftCell.style.height = position.y + 'px';
    }
    var dialogPlacerCell = memmlib.getTableCell('.dialog-placement-table', 2, 2);
    var dialogDiv = document.createElement("DIV");
    dialogDiv.setAttribute('class', 'dialog-outer-wrap');
    dialogPlacerCell.appendChild(dialogDiv);
    dialogDiv.innerHTML = html;
    if (position.width != undefined) {
        dialogPlacerCell.style.width = position.width + 'px';
    }

    dialogDiv.onclick = function() {
        body.removeChild(dialogPlacer);
        body.removeChild(shadowDiv);
        memmlib.dialogShown = false;
    };
    memmlib.dialogShown = true;
};

memmlib.generateTable = function(width, height) {
    var table = document.createElement("TABLE");
    var row;
    var cell;
    for (var i = 0; i < height; i++) {
        row = document.createElement("TR");
        table.appendChild(row);
        for (var j = 0; j < height; j++) {
            cell = document.createElement("TD");
            row.appendChild(cell);
        }
    }
    return table;
};

memmlib.getTableCell = function(tableSelector, i, j) {
    return document.querySelector(tableSelector+' tr:nth-child('+i+') td:nth-child('+j+')');
};
