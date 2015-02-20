var memmlib = memmlib || {};


memmlib.setLanguage = function(language){
    jsonRequest({
        url: '/json/language/set?language='+language,
        onSuccess: function(response) {
            location.reload();
        },
        onError: function(response) {
            alert('error');
        },
        data: {}
    });
};

memmlib.bindLanguageButtons = function() {
    var langButtons = document.querySelectorAll('.language-flag');
    var bindClick;
    for (var i = 0; i < langButtons.length; i++) {
        bindClick = function(button) {
            button.addEventListener('click', function() {
                memmlib.setLanguage(button.dataset.language)
            }, false);
        };
        bindClick(langButtons.item(i));
    }
};

window.addEventListener('load', memmlib.bindLanguageButtons, false);
