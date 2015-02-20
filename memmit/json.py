import json
from functools import wraps

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from memmit.memmits import get_memmit_by_type, simplify_memmit


class JsonResponse(HttpResponse):
    """
    HttpResponse descendant, which return response with ``application/json`` mimetype.
    """
    def __init__(self, data):
        super(JsonResponse, self).__init__(content=json.dumps(data), mimetype='application/json')


def ajax_request(func):
    """
    If view returned serializable dict, returns JsonResponse with this dict as content.
    """
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        response = func(request, *args, **kwargs)
        if isinstance(response, dict):
            return JsonResponse(response)
        else:
            return response
    return wrapper


class IsNotJson(ValueError):
    pass


def get_request_data(request, require_post=False, require_type=False):
    if require_post and request.method != 'POST':
        raise IsNotJson('Invalid request method: '+request.method)

    if require_type and request.META.get('CONTENT_TYPE') == 'application/json':
        raise IsNotJson('Invalid content-type: '+request.META.get('CONTENT_TYPE', ''))

    try:
        body = request.body.decode(request.encoding or 'utf-8')
        return json.loads(body)
    except ValueError:
        raise IsNotJson(request.body)


@ajax_request
def get_memmit(request, memmit_type):
    request_data = get_request_data(request)
    memm = get_memmit_by_type(memmit_type)
    memm.set_data(request_data['memmit']['data'])
    return {'code': 0, 'memmit': memm.as_json()}


@ajax_request
def get_randomized_memmit(request, memmit_type):
    memm = get_memmit_by_type(memmit_type)
    memm.randomize()
    return {'code': 0, 'memmit': memm.as_json()}


@csrf_exempt
@ajax_request
def get_simplified_memmit(request, memmit_type):
    request_data = get_request_data(request)
    memm = simplify_memmit(memmit_type, request_data['memmit']['data'])
    return {'code': 0, 'memmit': memm.as_json()}


@ajax_request
def set_language(request):
    language = request.REQUEST['language'].lower()
    request.session['django_language'] = language
    return {'code': 0, 'result': 'ok', 'language': language}
