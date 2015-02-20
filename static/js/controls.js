var memmlib = memmlib || {};


memmlib.setCaretPosition = function(el, pos){
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el, pos);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
};
