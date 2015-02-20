import random

from django.utils.translation import get_language

from .memmit import Memmit, MemmitError
from .transition import MemmitTransition
from ._numletter_maps import maps


class NumbersMemmit(Memmit):
    mtype = 'numbers'
    default_length = 40
    template_file = 'mt_numbers.html'

    def randomize(self, **kwargs):
        numbers = self._generate_numbers(**kwargs)
        self.data = {
            'id_map': {str(i): [str(i)] for i in range(len(numbers))},
            'numbers': numbers,
        }

    @staticmethod
    def _generate_numbers(length=default_length):
        return [random.randint(0, 9) for i in range(length)]


class NumbersToLettersTransition(MemmitTransition):
    @staticmethod
    def _check_translation_map(translation_map):
        for i in range(10):
            if str(i) not in translation_map:
                raise MemmitError('Invalid translation map')

    @staticmethod
    def _number_to_letter(number, translation_map):
        return translation_map[number]

    @classmethod
    def _translate_numbers(cls, numbers, translation_map):
        return [cls._number_to_letter(number, translation_map) for number in numbers]

    @classmethod
    def simplify(cls, data):
        translation_map = maps[get_language().split('-')[0]]
        letters = cls._translate_numbers(data['numbers'], translation_map)
        return 'numletters', {
            'id_map': {str(i): [str(i)] for i in range(len(letters))},
            'letters': letters,
        }
