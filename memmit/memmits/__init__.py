from . import _settings


def get_memmit_by_type(memmit_type):
    return _settings.MEMMITS[memmit_type]()


def simplify_memmit(memmit_type, data):
    new_memmit_type, new_data = _settings.TRANSITIONS[memmit_type].simplify(data)
    new_memmit = get_memmit_by_type(new_memmit_type)
    new_memmit.set_data(new_data)
    new_memmit.refreshable = False
    return new_memmit
