from .memmit import Memmit, MemmitError
from .transition import MemmitTransition


class NumLettersMemmit(Memmit):
    mtype = 'numletters'
    template_file = 'mt_numletters.html'

    def randomize(self, **kwargs):
        raise MemmitError('Not randomizable')


class NumLettersToWordsTransition(MemmitTransition):
    @classmethod
    def simplify(cls, data):
        return 'words', {
            'id_map': {str(i): [str(i//2)] for i in range(len(data['letters']))},
            'words': ['' for i in range(len(data['letters'])//2)],
        }
