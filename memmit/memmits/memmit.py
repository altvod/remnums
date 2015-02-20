import uuid
import os

from django.template.loader import render_to_string
from django.utils.translation import get_language

class MemmitError(Exception):
    pass


class Memmit():
    template_file = None
    mtype = 'memmit'
    simplifiable = True
    linked_to_parent = False

    def __init__(self):
        self.data = None
        self.refreshable = True
        self.id = uuid.uuid4().hex

    def randomize(self, **kwargs):
        raise NotImplementedError

    def set_data(self, data):
        self.data = data

    def as_json(self):
        return {
            'html': self.render(),
            'type': self.mtype,
            'id': self.id,
            'data': self.data,
            'attributes': {
                'refreshable': self.refreshable,
                'simplifiable': self.simplifiable,
                'linked_to_parent': self.linked_to_parent,
            },
        }

    def render(self):
        return render_to_string(self.template_file, {
            'data': self.data,
            'id': self.id,
            'type': self.mtype,
            'attributes': {
                'refreshable': self.refreshable,
                'simplifiable': self.simplifiable,
                'linked_to_parent': self.linked_to_parent,
            },
            'help': self.get_help(),
        })

    def get_help(self, language=None):
        language = language or get_language()[:2]
        filename = os.path.join(os.path.dirname(__file__), 'help', language, self.mtype+'.html')
        if not os.path.exists(filename):
            return '...'

        with open(filename) as help_file:
            return help_file.read()

