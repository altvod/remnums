from . import mt_numbers
from . import mt_numletters
from . import mt_words

MEMMITS = {
    mt_numbers.NumbersMemmit.mtype: mt_numbers.NumbersMemmit,
    mt_numletters.NumLettersMemmit.mtype: mt_numletters.NumLettersMemmit,
    mt_words.WordsMemmit.mtype: mt_words.WordsMemmit,
}

TRANSITIONS = {
    mt_numbers.NumbersMemmit.mtype: mt_numbers.NumbersToLettersTransition,
    mt_numletters.NumLettersMemmit.mtype: mt_numletters.NumLettersToWordsTransition,
}
