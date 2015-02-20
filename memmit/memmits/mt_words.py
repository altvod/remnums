from .memmit import Memmit, MemmitError


class WordsMemmit(Memmit):
    mtype = 'words'
    template_file = 'mt_words.html'
    simplifiable = False

    def randomize(self, **kwargs):
        raise MemmitError('Not randomizable')
