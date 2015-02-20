/**
 * Created by altvod on 2/8/15.
 */

urlEncode = function(data) {
    var agArr = [];
    for(var p in data)
    if (data.hasOwnProperty(p)) {
        agArr.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
    }
    return agArr.join("&");
};

makeUrl = function(url, data) {
    var agArr = [];
    for(var p in data)
    if (data.hasOwnProperty(p)) {
        agArr.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
    }
    var argStr = agArr.join("&");

    if (argStr) {
        if (url.indexOf('?') == -1) { // doesn't have args yet
            url += '?';
        } else {
            url += '&';
        }
        url += argStr;
    }
    return url;
};

simpleAjax = function(argdata)
{
    var url = argdata['url'];
    var method = argdata['method'] || 'get';
    var data = argdata['data'];
    var form = argdata['form'];
    var onSuccess = argdata['onSuccess'];
    var onError = argdata['onError'];
    var headers = argdata['headers'];
    var xmlhttp;
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                if (onSuccess) {
                    onSuccess(xmlhttp.responseText);
                }
            } else if (onError) {
                onError(xmlhttp.responseText);
            }
        }
    };
    for (var header in headers) {
        if (headers.hasOwnProperty(header)) {
            xmlhttp.setRequestHeader(header, headers[header]);
        }
    }
    if (method.toLowerCase() == 'post') {
        if (form) {
            data = new FormData(form);
        } else if (!data) {
            data = '';
        }
        xmlhttp.open(method, url, true);
        xmlhttp.send(data);
    } else {
        url = makeUrl(url, data);
        xmlhttp.open(method, url, true);
        xmlhttp.send();
    }
};

jsonRequest = function(argdata) {
    var data = argdata['data'];
    var onSuccess = argdata['onSuccess'];
    var onError = argdata['onError'];
    if (typeof data != 'string' && !(data instanceof String)) {
        data = JSON.stringify(data);
    }
    var onSuccessWrapper = function(responseData) {
        var jsonResponseData = JSON.parse(responseData);
        if (jsonResponseData['code'] == 0) {
            onSuccess(jsonResponseData);
        } else if (onError)  {
            onError(jsonResponseData);
        }
    };
    var onErrorWrapper = function(responseData) {
        onError({
            code: -1,
            error: {
                message: 'Unknown Error',
                data: {
                    response: responseData
                }
            }
        });
    };
    simpleAjax({
        url: argdata['url'],
        method: argdata['method'],
        data: data,
        form: argdata['form'],
        headers: argdata['headers'],
        onSuccess: onSuccessWrapper,
        onError: onErrorWrapper
    });
};