/**
 * Created by altvod on 2/8/15.
 */

var memmlib = memmlib || {};


memmlib.memmitTypeRegistry = {};
memmlib.memmitRegistry = {};
memmlib.initialMemmitData = memmlib.initialMemmitData || {};
memmlib.ajaxLock = false;


/** @constructor */
memmlib.Memmit = function() {
    this.container = null;
    this.type = null;
    this.id = null;
    this.data = null;
    this.simplified = false;
    this.hidden = false;
    this.highlighted = [];
};

memmlib.Memmit.prototype.initialize = function(args) {
    this.container = args.container;
    this.type = args.type;
    this.id = args.id;
    this.data = args.data || memmlib.initialMemmitData[this.id].data || {};
    this.attributes = args.attributes || memmlib.initialMemmitData[this.id].attributes || {};

    this.data.reversed_id_map = this.reverseIdMap(this.data.id_map);

    var self = this;
    this.container.memmit = self;

    // initialize buttons
    this.bindClickToChild('.memmit-refresh-btn', function(e) {self.refresh();});
    this.bindClickToChild('.memmit-help-btn', function(e) {self.showHelp();});
    this.bindClickToChild('.memmit-simplify-btn', function(e) {self.simplify();});
    this.bindClickToChild('.memmit-hide-simplified-btn', function(e) {self.removeSimplified();});
    this.bindClickToChild('.memmit-hide-btn', function(e) {self.hide();});
    this.bindClickToChild('.memmit-show-btn', function(e) {self.show();});
    this.bindClickToChild('.memmit-guessit-btn', function(e) {self.allGotoGuessit();});
    this.bindClickToChild('.memmit-submit-btn', function(e) {self.submit();});
    this.bindEventToChildren('[data-memmit-internal-id]', 'mouseover', function(e) {self.highlightRelated(e);});
    this.bindEventToChildren('[data-memmit-internal-id]', 'mouseout', function(e) {self.clearHighlighted();});

    // hints
    this.bindHints();
};

memmlib.Memmit.prototype.reverseIdMap = function(mapping) {
    var reverseMapping = {};
    var internalId;
    for (var externalId in mapping) {
        if (mapping.hasOwnProperty(externalId)) {
            for (var i = 0; i < mapping[externalId].length; i++) {
                internalId = mapping[externalId][i];
                reverseMapping[internalId] = reverseMapping[internalId] || [];
                reverseMapping[internalId].push(externalId);
            }
        }
    }
    return reverseMapping;
};

memmlib.Memmit.prototype.findChildBySelector = function(childSelector) {
    return document.querySelector('[data-memmit-id="'+this.id+'"] '+childSelector);
};

memmlib.Memmit.prototype.findChildrenBySelector = function(childSelector) {
    return document.querySelectorAll('[data-memmit-id="'+this.id+'"] '+childSelector);
};

memmlib.Memmit.prototype.bindClickToChild = function(childSelector, callback) {
    var button = this.findChildBySelector(childSelector);
    if (button != undefined) {
        button.addEventListener('click', function (event) {
            callback(event);
        });
    }
};

memmlib.Memmit.prototype.bindEventToChildren = function(childSelector, eventType, callback) {
    var elements = this.findChildrenBySelector(childSelector);
    for (var i = 0; i < elements.length; i++) {
        elements.item(i).addEventListener(eventType, function (event) {
            callback(event);
        });
    }
};

memmlib.Memmit.prototype.showHint = function(html) {
    var hintBox = this.findChildBySelector('.memmit-hint-box');
    if (hintBox) {
        hintBox.style.display = 'block';
        hintBox.innerHTML = html;
    }
};
memmlib.Memmit.prototype.bindHints = function() {
    var hints = this.findChildrenBySelector('.memmit-hint');
    var bindHint;
    var self = this;
    for (var i = 0; i < hints.length; i++) {
        bindHint = function (hint) {
            self.bindEventToChildren(hint.dataset.hintFor, 'mouseover', function (event) {
                self.showHint(hint.innerHTML);
            });
            self.bindEventToChildren(hint.dataset.hintFor, 'mouseout', function (event) {
                self.showHint('');
            });
        };
        bindHint(hints.item(i));
    }
};

memmlib.Memmit.prototype.showHelp = function() {
    var helpBox = this.findChildBySelector('.memmit-help-container');
    memmlib.showSimpleDialog(helpBox.innerHTML, {y: 80, width: 600});
};

memmlib.Memmit.prototype.displayChildBySelector = function(childSelector, display) {
    if (display == undefined) {
        display = 'block';
    }
    var element = this.findChildBySelector(childSelector);
    element.style.display = display;
};

memmlib.Memmit.prototype.hideChildBySelector = function(childSelector) {
    var element = this.findChildBySelector(childSelector);
    if (element != undefined) {
        element.style.display = 'none';
    }
};

memmlib.Memmit.prototype.replace = function(args) {
    this.removeSimplified();
    this.container.innerHTML = args.html;
    memmlib.unRegisterMemmit(this.id);
    memmlib.registerMemmit(this.container, args.data, args.attributes);
};

memmlib.Memmit.prototype.refresh = function() {
    if (memmlib.ajaxLock) {
        return
    }
    var self = this;
    memmlib.ajaxLock = true;
    jsonRequest({
        url: '/json/memmit/'+self.type+'/random',
        onSuccess: function(response) {
            self.replace(response.memmit);
            memmlib.ajaxLock = false;
        },
        onError: function(response) {
            memmlib.ajaxLock = false;
            memmlib.showSimpleDialog('&lt;h2&gt;Server Error&lt;/h2&gt;'+
                                     '&lt;p&gt;'+JSON.stringify(response)+'&lt;/h2&gt;');
        },
        data: {}
    });
};

memmlib.Memmit.prototype.hideMemmit = function() {
    this.hideChildBySelector('.memmit-inner-wrap');
};

memmlib.Memmit.prototype.showMemmit = function() {
    this.displayChildBySelector('.memmit-inner-wrap');
};

memmlib.Memmit.prototype.showPlaceholder = function() {
    this.displayChildBySelector('.memmit-hidden-placeholder');
};

memmlib.Memmit.prototype.hidePlaceholder = function() {
    this.hideChildBySelector('.memmit-hidden-placeholder');
};

memmlib.Memmit.prototype.showGuessit = function() {
    this.displayChildBySelector('.guessit-inner-wrap');
};

memmlib.Memmit.prototype.hideGuessit = function() {
    this.hideChildBySelector('.guessit-inner-wrap');
};

memmlib.Memmit.prototype.hide = function() {
    if (this.hidden) {
        return;
    }
    this.hideSimplified();
    this.hideMemmit();
    this.showPlaceholder();
    this.hidden = true;
};

memmlib.Memmit.prototype.show = function() {
    this.hidePlaceholder();
    this.showMemmit();
    this.hidden = false;
};

memmlib.Memmit.prototype.gotoGuessit = function() {
    this.hideMemmit();
    this.hidePlaceholder();
    this.hideChildBySelector('.memmit-simplify-btn');
    this.hideChildBySelector('.memmit-hide-simplified-btn');
    this.showGuessit();
};
memmlib.Memmit.prototype.allGotoGuessit = function() {
    for (var memmitId in memmlib.memmitRegistry) {
        if (memmlib.memmitRegistry.hasOwnProperty(memmitId)) {
            memmlib.memmitRegistry[memmitId].gotoGuessit();
        }
    }
};

memmlib.Memmit.prototype.checkGuessit = function() {
    alert('Not Implemented!');
};

memmlib.Memmit.prototype.submit = function() {
    this.hideChildBySelector('.memmit-submit-btn');
    var result = this.checkGuessit();
};

memmlib.Memmit.prototype.simplify = function() {
    if (this.simplified) {
        return;
    }
    if (memmlib.ajaxLock) {
        return;
    }
    memmlib.ajaxLock = true;
    var self = this;
    jsonRequest({
        url: '/json/memmit/'+self.type+'/simplify',
        onSuccess: function(response) {
            memmlib.addNewMemmit(response.memmit);
            self.hideChildBySelector('.memmit-simplify-btn');
            self.displayChildBySelector('.memmit-hide-simplified-btn', 'inline-block');
            self.simplified = true;
            memmlib.ajaxLock = false;
        },
        onError: function(response) {
            memmlib.ajaxLock = false;
            memmlib.showSimpleDialog('&lt;h2&gt;Server Error&lt;/h2&gt;'+
                                     '&lt;p&gt;'+JSON.stringify(response)+'&lt;/h2&gt;');
        },
        data: {memmit: {data: self.data}},
        method: 'post'
    });
};

memmlib.Memmit.prototype.remove = function() {
    this.removeSimplified();
    memmlib.unRegisterMemmit(this.id);
    this.container.parentNode.removeChild(this.container);
};

memmlib.Memmit.prototype.removeSimplified = function() {
    var nextContainer = this.container.nextElementSibling;
    if (!nextContainer) {
        return;
    }
    var simplified = nextContainer.memmit;
    simplified.remove();
    this.simplified = false;
    this.hideChildBySelector('.memmit-hide-simplified-btn');
    this.displayChildBySelector('.memmit-simplify-btn', 'inline-block');
};

memmlib.Memmit.prototype.hideSimplified = function() {
    var nextContainer = this.container.nextElementSibling;
    if (!nextContainer) {
        return;
    }
    var simplified = nextContainer.memmit;
    simplified.hide();
};

memmlib.Memmit.prototype.highlightById = function(externalId) {
    var internalId;
    var elements;
    for (var i = 0; i < this.data.id_map[externalId].length; i++) {
        internalId = this.data.id_map[externalId][i];
        elements = this.findChildrenBySelector('[data-memmit-internal-id="'+internalId+'"]');
        for (var j = 0; j < elements.length; j++) {
            if (elements[j].originalClass == undefined) {
                elements[j].originalClass = elements[j].className;
            }
            elements[j].className = elements[j].dataset.highlightedClass;
            this.highlighted.push(elements[j]);
        }
    }
};
memmlib.Memmit.prototype.highlightRelated = function(e) {
    var internalId = e.currentTarget.dataset.memmitInternalId;
    var externalIds = this.data.reversed_id_map[internalId];
    for (var i = 0; i < externalIds.length; i++) {
        for (var memmitId in memmlib.memmitRegistry) {
            if (memmlib.memmitRegistry.hasOwnProperty(memmitId)) {
                memmlib.memmitRegistry[memmitId].highlightById(externalIds[i]);
            }
        }
    }
};
memmlib.Memmit.prototype.clearOwnHighlighted = function() {
    var element;
    for (0; this.highlighted[0] != undefined; 0) {
        element = this.highlighted.pop();
        if (element.originalClass != undefined) {
            element.className = element.originalClass;
        }
        element.originalClass = undefined;
    }
};
memmlib.Memmit.prototype.clearHighlighted = function() {
    for (var memmitId in memmlib.memmitRegistry) {
        if (memmlib.memmitRegistry.hasOwnProperty(memmitId)) {
            memmlib.memmitRegistry[memmitId].clearOwnHighlighted();
        }
    }
};



memmlib.registerMemmitType = function(memmitTypeName, memmitTypeClass) {
    memmlib.memmitTypeRegistry[memmitTypeName] = memmitTypeClass;
};

memmlib.registerMemmit = function(container, data, attributes) {
    var wrapEl = container.getElementsByTagName('div')[0];
    var memmitType = wrapEl.dataset.memmitType;
    var memmitId = wrapEl.dataset.memmitId;
    var memmit = new memmlib.memmitTypeRegistry[memmitType]();

    if (data == undefined) {
        data = memmlib.initialMemmitData[memmitId].data || {};
    }
    if (attributes == undefined) {
        attributes = memmlib.initialMemmitData[memmitId].attributes || {};
    }

    memmlib.memmitRegistry[memmitId] = memmit;
    memmit.initialize({
        container: container,
        type: memmitType,
        id: memmitId,
        data: data,
        attributes: attributes
    });
};

memmlib.unRegisterMemmit = function(memmitId) {
    delete memmlib.memmitRegistry[memmitId];
};

memmlib.registerAllMemmits = function() {
    var memmits = document.querySelectorAll('.memmit-container');
    for (var i = 0; i < memmits.length; i++) {
        var memmit = memmits.item(i);
        memmlib.registerMemmit(memmit);
    }
};

window.addEventListener('load', memmlib.registerAllMemmits, false);

memmlib.addNewMemmit = function(args) {
    var containerParent = document.querySelector('.memmit-container').parentNode;
    var newContainer = document.createElement('DIV');
    newContainer.className = 'memmit-container';
    newContainer.innerHTML = args.html;
    containerParent.appendChild(newContainer);
    memmlib.registerMemmit(newContainer, args.data, args.attributes);
};



/** @constructor */
memmlib.NumbersMemmit = function() {
    memmlib.Memmit.call(this);
};
memmlib.NumbersMemmit.prototype = Object.create(memmlib.Memmit.prototype);
memmlib.NumbersMemmit.constructor = memmlib.NumbersMemmit;
memmlib.registerMemmitType('numbers', memmlib.NumbersMemmit);

memmlib.NumbersMemmit.prototype.superInitialize = memmlib.Memmit.prototype.initialize;
memmlib.NumbersMemmit.prototype.initialize = function(args) {
    this.superInitialize(args);
    var self = this;
    this.bindEventToChildren('.mt-numbers-number-input', 'keydown', function(e) {self.enterNumber(e);});
};

memmlib.NumbersMemmit.prototype.superGotoGuessit = memmlib.Memmit.prototype.gotoGuessit;
memmlib.NumbersMemmit.prototype.gotoGuessit = function() {
    this.superGotoGuessit();
    var firstNum = this.findChildBySelector('.mt-numbers-number-input');
    firstNum.focus();
};

memmlib.NumbersMemmit.prototype.getInputByNum = function(inputNum) {
    return this.findChildBySelector('[data-input-num="'+inputNum+'"]');
};

memmlib.NumbersMemmit.prototype.focusToInput = function(inputNum, inc) {
    if (typeof inputNum == 'string' || inputNum instanceof String) {
        inputNum = parseInt(inputNum);
    }
    var nextInput = this.getInputByNum(inputNum+inc);
    if (nextInput != undefined) {
        nextInput.focus();
    }
};

memmlib.NumbersMemmit.prototype.enterNumber = function(e) {
    var input = e.currentTarget;
    if (e.keyCode == 8 || e.keyCode == 46) {// 8 is Backspace, 46 is Delete
        if (e.ctrlKey && e.keyCode == 8) {// delete this number and go to previous
            input.innerHTML = '';
            this.focusToInput(input.dataset.inputNum, -1);
        } else if (e.ctrlKey && e.keyCode == 46) {// delete this number and go to next
            input.innerHTML = '';
            this.focusToInput(input.dataset.inputNum, 1);
        } else {
            return;
        }
    } else if (e.keyCode == 37 || e.keyCode == 39) {// left and right arrow keys
        if (e.ctrlKey) {// go to neighbor number
            this.focusToInput(input.dataset.inputNum, e.keyCode-38);
        } else {
            return;
        }
    } else if (48 <= e.keyCode && e.keyCode <= 57) {
        input.innerHTML = String.fromCharCode(e.keyCode);
        memmlib.setCaretPosition(input, 1);
        this.focusToInput(input.dataset.inputNum, 1);
    }
    e.preventDefault();
};

memmlib.NumbersMemmit.prototype.markNumberInputWrong = function(inputNum) {
    var input = this.getInputByNum(inputNum);
    input.className = 'mt-numbers-number-input-wrong';
};

memmlib.NumbersMemmit.prototype.markNumberInputRight = function(inputNum) {
    var input = this.getInputByNum(inputNum);
    input.className = 'mt-numbers-number-input-right';
};

memmlib.NumbersMemmit.prototype.checkGuessit = function() {
    var result = true;
    var elements = this.findChildrenBySelector('.mt-numbers-number-input');
    var expectedNnumbers = this.data.numbers;
    for (var i = 0; i < elements.length; i++) {
        if (elements.item(i).innerHTML != expectedNnumbers[i].toString()) {
            this.markNumberInputWrong(i);
            result = false;
        } else {
            this.markNumberInputRight(i);
        }
    }
    return result;
};


/** @constructor */
memmlib.NumLettersMemmit = function() {
    this.hoverLetterNum = null;
    memmlib.Memmit.call(this);
};
memmlib.NumLettersMemmit.prototype = Object.create(memmlib.Memmit.prototype);
memmlib.NumLettersMemmit.constructor = memmlib.NumLettersMemmit;
memmlib.registerMemmitType('numletters', memmlib.NumLettersMemmit);

memmlib.NumLettersMemmit.prototype.superInitialize = memmlib.Memmit.prototype.initialize;
memmlib.NumLettersMemmit.prototype.initialize = function(args) {
    this.superInitialize(args);
    var self = this;
    this.bindEventToChildren('.mt-numletters-letter', 'mouseover', function(e) {self.mouseEnterLetter(e);});
    this.bindEventToChildren('.mt-numletters-letter', 'mouseout', function(e) {self.mouseLeaveLetter(e);});
    this.bindEventToChildren('.mt-numletters-letter-variant', 'click', function(e) {self.selectLetterVariant(e);});
    this.bindEventToChildren('.mt-numletters-letter-input', 'keydown', function(e) {self.enterLetter(e);});
};

memmlib.NumLettersMemmit.prototype.mouseEnterLetter = function(e) {
    var letterEl = e.currentTarget;
    var num = parseInt(letterEl.dataset.numletterNum);
    this.displayChildBySelector('[data-numletter-num="'+num+'"] .mt-numletters-letter-chooser');
    this.hoverLetterNum = num;
};

memmlib.NumLettersMemmit.prototype.mouseLeaveLetter = function(e) {
    var letterEl = e.currentTarget;
    var num = parseInt(letterEl.dataset.numletterNum);
    this.hideChildBySelector('[data-numletter-num="'+num+'"] .mt-numletters-letter-chooser');
};

memmlib.NumLettersMemmit.prototype.selectLetterVariant = function(e) {
    var variantEl = e.currentTarget;
    var letterEl = this.findChildBySelector('[data-numletter-num="'+this.hoverLetterNum+'"]').firstElementChild;
    letterEl.innerHTML = variantEl.innerHTML;
    this.hideChildBySelector('[data-numletter-num="'+this.hoverLetterNum+'"] .mt-numletters-letter-chooser');
};

memmlib.NumLettersMemmit.prototype.superGotoGuessit = memmlib.Memmit.prototype.gotoGuessit;
memmlib.NumLettersMemmit.prototype.gotoGuessit = function() {
    this.superGotoGuessit();
    var firstLetter = this.findChildBySelector('.mt-numletters-letter-input');
    firstLetter.focus();
};

memmlib.NumLettersMemmit.prototype.getInputByNum = function(inputNum) {
    return this.findChildBySelector('[data-input-num="'+inputNum+'"]');
};

memmlib.NumLettersMemmit.prototype.focusToInput = function(inputNum, inc) {
    if (typeof inputNum == 'string' || inputNum instanceof String) {
        inputNum = parseInt(inputNum);
    }
    var nextInput = this.getInputByNum(inputNum+inc);
    if (nextInput != undefined) {
        nextInput.focus();
    }
};

memmlib.NumLettersMemmit.prototype.enterLetter = function(e) {
    var input = e.currentTarget;
    if (e.keyCode == 8 || e.keyCode == 46) {// 8 is Backspace, 46 is Delete
        if (e.ctrlKey && e.keyCode == 8) {// delete this number and go to previous
            input.innerHTML = '';
            this.focusToInput(input.dataset.inputNum, -1);
        } else if (e.ctrlKey && e.keyCode == 46) {// delete this number and go to next
            input.innerHTML = '';
            this.focusToInput(input.dataset.inputNum, 1);
        } else {
            return;
        }
        e.preventDefault();
    } else if (e.keyCode == 37 || e.keyCode == 39) {// left and right arrow keys
        if (e.ctrlKey) {// go to neighbor number
            this.focusToInput(input.dataset.inputNum, e.keyCode-38);
        } else {
            return;
        }
        e.preventDefault();
    }
};

memmlib.NumLettersMemmit.prototype.markLetterInputWrong = function(inputNum) {
    var input = this.getInputByNum(inputNum);
    input.className = 'mt-numletters-letter-input-wrong';
};

memmlib.NumLettersMemmit.prototype.markLetterInputRight = function(inputNum) {
    var input = this.getInputByNum(inputNum);
    input.className = 'mt-numletters-letter-input-right';
};

memmlib.NumLettersMemmit.prototype.checkGuessit = function() {
    var result = true;
    var elements = this.findChildrenBySelector('.mt-numletters-letter-input');
    var expectedLetters = this.data.letters;
    var letterVariants;
    var variantMatch;
    for (var i = 0; i < elements.length; i++) {
        letterVariants = expectedLetters[i].repr;
        variantMatch = false;
        for (var j = 0; j < letterVariants.length; j++) {
            if (elements.item(i).innerHTML == letterVariants[j]) {
                variantMatch = true;
            }
        }
        if (!variantMatch) {
            this.markLetterInputWrong(i);
            result = false;
        } else {
            this.markLetterInputRight(i);
        }
    }
    return result;
};


/** @constructor */
memmlib.WordsMemmit = function() {
    this.hoverLetterNum = null;
    memmlib.Memmit.call(this);
};
memmlib.WordsMemmit.prototype = Object.create(memmlib.Memmit.prototype);
memmlib.WordsMemmit.constructor = memmlib.WordsMemmit;
memmlib.registerMemmitType('words', memmlib.WordsMemmit);

memmlib.WordsMemmit.prototype.superInitialize = memmlib.Memmit.prototype.initialize;
memmlib.WordsMemmit.prototype.initialize = function(args) {
    this.superInitialize(args);
    var self = this;
    this.bindEventToChildren('.mt-words-word-input', 'keydown', function(e) {self.enterWord(e);});
    this.bindEventToChildren('[data-memmit-internal-id]', 'focus', function(e) {self.highlightRelated(e);});
    this.bindEventToChildren('[data-memmit-internal-id]', 'keydown', function(e) {self.highlightRelated(e);});
    this.bindEventToChildren('[data-memmit-internal-id]', 'blur', function(e) {self.clearHighlighted();});
};

memmlib.WordsMemmit.prototype.superGotoGuessit = memmlib.Memmit.prototype.gotoGuessit;
memmlib.WordsMemmit.prototype.gotoGuessit = function() {
    this.updateData();
    this.superGotoGuessit();
    var firstWord = this.findChildBySelector('.mt-words-word-input');
    firstWord.focus();
};


memmlib.WordsMemmit.prototype.getInputByNum = function(inputNum) {
    return this.findChildBySelector('[data-input-num="'+inputNum+'"]');
};

memmlib.WordsMemmit.prototype.updateData = function() {
    var wordElements = this.findChildrenBySelector('.mt-words-word');
    for (var i = 0; i < wordElements.length; i++) {
        this.data.words[i] = wordElements[i].innerHTML;
    }
};

memmlib.WordsMemmit.prototype.focusToInput = function(inputNum, inc) {
    if (typeof inputNum == 'string' || inputNum instanceof String) {
        inputNum = parseInt(inputNum);
    }
    var nextInput = this.getInputByNum(inputNum+inc);
    if (nextInput != undefined) {
        nextInput.focus();
    }
};

memmlib.WordsMemmit.prototype.enterWord = function(e) {
    var input = e.currentTarget;
    if (e.keyCode == 8 || e.keyCode == 46) {// 8 is Backspace, 46 is Delete
        if (e.ctrlKey && e.keyCode == 8) {// delete this number and go to previous
            input.innerHTML = '';
            this.focusToInput(input.dataset.inputNum, -1);
        } else if (e.ctrlKey && e.keyCode == 46) {// delete this number and go to next
            input.innerHTML = '';
            this.focusToInput(input.dataset.inputNum, 1);
        } else {
            return;
        }
        e.preventDefault();
    } else if (e.keyCode == 37 || e.keyCode == 39) {// left and right arrow keys
        if (e.ctrlKey) {// go to neighbor number
            this.focusToInput(input.dataset.inputNum, e.keyCode-38);
        } else {
            return;
        }
        e.preventDefault();
    }
};

memmlib.WordsMemmit.prototype.markWordInputWrong = function(inputNum) {
    var input = this.getInputByNum(inputNum);
    input.className = 'mt-words-word-input-wrong';
};

memmlib.WordsMemmit.prototype.markWordInputRight = function(inputNum) {
    var input = this.getInputByNum(inputNum);
    input.className = 'mt-words-word-input-right';
};

memmlib.WordsMemmit.prototype.checkGuessit = function() {
    var result = true;
    var elements = this.findChildrenBySelector('.mt-words-word-input');
    var expectedWords = this.data.words;
    for (var i = 0; i < elements.length; i++) {
        if (elements.item(i).innerHTML != expectedWords[i]) {
            this.markWordInputWrong(i);
            result = false;
        } else {
            this.markWordInputRight(i);
        }
    }
    return result;
};
